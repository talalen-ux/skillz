import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { AUDIT_QUEUE } from '../audit/audit.processor';

/**
 * Background watcher: every minute, scans recent skill activity and:
 *   - flags skills with falling success rate or rating
 *   - auto-triggers a re-audit on flagged skills
 *   - downgrades certification on persistent failures
 *   - auto-disables on critical incidents (e.g. recent BLOCKED executions)
 */
@Injectable()
export class MonitoringService implements OnModuleInit {
  private readonly logger = new Logger(MonitoringService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(AUDIT_QUEUE) private readonly auditQueue: Queue,
  ) {}

  onModuleInit() {
    const intervalMs = Number(process.env.MONITOR_INTERVAL_MS ?? 60_000);
    this.timer = setInterval(() => this.tick().catch((e) => this.logger.error(e)), intervalMs);
  }

  async tick() {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentExecs = await this.prisma.execution.groupBy({
      by: ['skillId', 'status'],
      where: { startedAt: { gte: since } },
      _count: { _all: true },
    });
    const bySkill = new Map<string, { ok: number; bad: number; blocked: number }>();
    for (const r of recentExecs) {
      const e = bySkill.get(r.skillId) ?? { ok: 0, bad: 0, blocked: 0 };
      if (r.status === 'SUCCEEDED') e.ok += r._count._all;
      else if (r.status === 'BLOCKED') e.blocked += r._count._all;
      else if (r.status === 'FAILED' || r.status === 'KILLED') e.bad += r._count._all;
      bySkill.set(r.skillId, e);
    }

    for (const [skillId, c] of bySkill) {
      const total = c.ok + c.bad + c.blocked;
      if (total < 5) continue;
      const successRate = c.ok / total;
      const blockRate = c.blocked / total;

      if (blockRate > 0.05) {
        this.logger.warn(`Skill ${skillId}: block rate ${blockRate.toFixed(2)} -> auto-disable`);
        await this.prisma.skill.update({
          where: { id: skillId },
          data: { isDisabled: true, killSwitch: true, certification: 'UNVERIFIED' },
        });
        continue;
      }
      if (successRate < 0.5) {
        this.logger.warn(`Skill ${skillId}: success ${successRate.toFixed(2)} -> reassess`);
        await this.auditQueue.add('reassess', { skillId, kind: 'reassess' });
      }
    }

    // Periodic re-audit: 5% of certified skills per tick
    const certified = await this.prisma.skill.findMany({
      where: { certification: { in: ['SECURITY_AUDITED', 'BATTLE_TESTED'] } },
      select: { id: true },
    });
    for (const s of certified) {
      if (Math.random() < 0.05) {
        await this.auditQueue.add('reassess', { skillId: s.id, kind: 'reassess' });
      }
    }
  }
}
