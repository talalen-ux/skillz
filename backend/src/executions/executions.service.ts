import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ExecutionStatus, Prisma } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { SkillsService } from '../skills/skills.service';
import { normalizePermissions, SkillPermissions, validateInputs } from './permissions';
import { SandboxClient, SandboxRunResult } from './sandbox.client';

@Injectable()
export class ExecutionsService {
  private readonly logger = new Logger(ExecutionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sandbox: SandboxClient,
    private readonly skills: SkillsService,
  ) {}

  async execute(
    skillId: string,
    userId: string | undefined,
    inputs: Record<string, unknown>,
  ) {
    const skill = await this.prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) throw new NotFoundException('Skill not found');
    if (skill.killSwitch || skill.isDisabled) {
      throw new ForbiddenException('Skill is disabled by kill-switch');
    }
    const version = await this.skills.getCurrentVersion(skillId);
    if (!version) throw new NotFoundException('No version available');

    const perms = normalizePermissions(skill.permissionsRequired as SkillPermissions);
    const valid = validateInputs(perms, inputs);
    if (!valid.ok) throw new BadRequestException(valid.reason);

    const exec = await this.prisma.execution.create({
      data: {
        skillId,
        versionId: version.id,
        userId,
        inputs: inputs as any,
        status: ExecutionStatus.RUNNING,
      },
    });

    let result: SandboxRunResult;
    try {
      result = await this.sandbox.run({
        executionId: exec.id,
        code: version.code,
        manifest: version.manifest as any,
        inputs,
        permissions: perms,
      });
    } catch (err: any) {
      this.logger.error(`Sandbox call failed: ${err.message}`);
      await this.prisma.execution.update({
        where: { id: exec.id },
        data: {
          status: ExecutionStatus.FAILED,
          error: `sandbox_error: ${err.message}`,
          finishedAt: new Date(),
        },
      });
      throw err;
    }

    await this.persistResult(exec.id, result);
    await this.skills.refreshAggregates(skillId);
    return this.get(exec.id);
  }

  async persistResult(executionId: string, result: SandboxRunResult) {
    await this.prisma.execution.update({
      where: { id: executionId },
      data: {
        status: result.status as ExecutionStatus,
        output: result.output as any,
        error: result.error,
        durationMs: result.durationMs,
        apiCalls: result.apiCalls as any,
        finishedAt: new Date(),
      },
    });
    await this.appendLogs(
      executionId,
      result.logs.map((l) => ({ level: l.level, message: l.message, metadata: l.metadata })),
    );
    if (result.blocked && result.blocked.length) {
      await this.appendLogs(
        executionId,
        result.blocked.map((b) => ({
          level: 'security',
          message: `BLOCKED: ${b.reason}`,
        })),
      );
    }
  }

  /** Append-only, hash-chained log entries. */
  async appendLogs(
    executionId: string,
    entries: { level: string; message: string; metadata?: Record<string, unknown> }[],
  ) {
    const last = await this.prisma.log.findFirst({
      where: { executionId },
      orderBy: { timestamp: 'desc' },
    });
    let prevHash = last?.hash ?? null;
    for (const e of entries) {
      const payload = JSON.stringify({
        executionId,
        level: e.level,
        message: e.message,
        metadata: e.metadata ?? null,
        ts: Date.now(),
        prevHash,
      });
      const hash = createHash('sha256').update(payload).digest('hex');
      await this.prisma.log.create({
        data: {
          executionId,
          level: e.level,
          message: e.message,
          metadata: (e.metadata ?? Prisma.JsonNull) as any,
          prevHash,
          hash,
        },
      });
      prevHash = hash;
    }
  }

  async get(id: string) {
    const exec = await this.prisma.execution.findUnique({
      where: { id },
      include: { logs: { orderBy: { timestamp: 'asc' } } },
    });
    if (!exec) throw new NotFoundException();
    return exec;
  }

  async list(skillId?: string, userId?: string) {
    return this.prisma.execution.findMany({
      where: { ...(skillId ? { skillId } : {}), ...(userId ? { userId } : {}) },
      orderBy: { startedAt: 'desc' },
      take: 50,
    });
  }
}
