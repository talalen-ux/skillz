import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AuditStage, CertificationStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SandboxClient } from '../executions/sandbox.client';
import { normalizePermissions, SkillPermissions } from '../executions/permissions';
import { deriveCertification, AuditSummary } from './certification';
import { SkillsService } from '../skills/skills.service';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly sandbox: SandboxClient,
    private readonly skills: SkillsService,
  ) {}

  /**
   * Runs the full pipeline:
   *   STATIC -> SANDBOX -> SCENARIO -> PERFORMANCE -> ADVERSARIAL -> CERT
   * Each stage is independently recorded. Returns the new certification.
   */
  async runFullPipeline(skillId: string) {
    const skill = await this.prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) throw new NotFoundException('Skill not found');
    const version = await this.skills.getCurrentVersion(skillId);
    if (!version) throw new NotFoundException('No version available');
    const perms = normalizePermissions(skill.permissionsRequired as SkillPermissions);

    const summary: AuditSummary = {
      staticPassed: false,
      staticRiskScore: 100,
      sandboxPassed: false,
      scenarioPassRate: 0,
      performanceScore: skill.performanceScore,
      adversarialPassed: false,
      totalExecutions: skill.totalExecutions,
    };

    // 1) Static analysis
    try {
      const r = await this.sandbox.analyze(version.code, version.manifest as any);
      summary.staticRiskScore = r.riskScore;
      summary.staticPassed = r.riskScore < 60;
      await this.recordResult(skillId, version.id, AuditStage.STATIC, summary.staticPassed, {
        riskScore: r.riskScore,
        findings: r.findings,
      });
    } catch (e: any) {
      await this.recordResult(skillId, version.id, AuditStage.STATIC, false, {
        error: e.message,
      });
    }

    // 2) Sandbox smoke test (mocked APIs)
    try {
      const r = await this.sandbox.run({
        executionId: `audit_${skillId}_${Date.now()}`,
        code: version.code,
        manifest: version.manifest as any,
        inputs: { __mock: true },
        permissions: perms,
        mode: 'mock',
      });
      summary.sandboxPassed = r.status === 'SUCCEEDED' && (!r.blocked || r.blocked.length === 0);
      await this.recordResult(skillId, version.id, AuditStage.SANDBOX, summary.sandboxPassed, {
        status: r.status,
        durationMs: r.durationMs,
        blocked: r.blocked ?? [],
      });
    } catch (e: any) {
      await this.recordResult(skillId, version.id, AuditStage.SANDBOX, false, {
        error: e.message,
      });
    }

    // 3) Scenario tests
    try {
      const r = await this.sandbox.runScenarios({
        code: version.code,
        manifest: version.manifest as any,
        permissions: perms,
        category: skill.category,
      });
      summary.scenarioPassRate = r.total > 0 ? r.passed / r.total : 0;
      await this.recordResult(
        skillId,
        version.id,
        AuditStage.SCENARIO,
        summary.scenarioPassRate >= 0.8,
        { passed: r.passed, total: r.total, cases: r.cases },
      );
    } catch (e: any) {
      await this.recordResult(skillId, version.id, AuditStage.SCENARIO, false, {
        error: e.message,
      });
    }

    // 4) Performance validation (composite of historical + scenario)
    const aggregates = await this.skills.refreshAggregates(skillId);
    summary.performanceScore = aggregates.performanceScore;
    summary.totalExecutions = aggregates.totalExecutions;
    await this.recordResult(skillId, version.id, AuditStage.PERFORMANCE, summary.performanceScore >= 70, {
      performanceScore: summary.performanceScore,
      successRate: aggregates.successRate,
      avgLatencyMs: aggregates.avgLatencyMs,
    });

    // 5) Adversarial / prompt-injection
    try {
      const r = await this.sandbox.runAdversarial({
        code: version.code,
        manifest: version.manifest as any,
        permissions: perms,
      });
      summary.adversarialPassed = r.safe;
      await this.recordResult(skillId, version.id, AuditStage.ADVERSARIAL, r.safe, {
        findings: r.findings,
      });
    } catch (e: any) {
      await this.recordResult(skillId, version.id, AuditStage.ADVERSARIAL, false, {
        error: e.message,
      });
    }

    // 6) Certification
    const newCert = deriveCertification(summary);
    const updated = await this.prisma.skill.update({
      where: { id: skillId },
      data: {
        certification: newCert,
        riskScore: summary.staticRiskScore,
      },
    });
    return { certification: updated.certification, summary };
  }

  /** Continuous-monitoring trigger: re-derive cert from existing evidence and downgrade if needed. */
  async reassess(skillId: string) {
    const skill = await this.prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) throw new NotFoundException();
    const recent = await this.prisma.auditResult.findMany({
      where: { skillId },
      orderBy: { createdAt: 'desc' },
      take: 25,
    });
    const last = (stage: AuditStage) => recent.find((a) => a.stage === stage);
    const summary: AuditSummary = {
      staticPassed: !!last(AuditStage.STATIC)?.passed,
      staticRiskScore: (last(AuditStage.STATIC)?.findings as any)?.riskScore ?? skill.riskScore,
      sandboxPassed: !!last(AuditStage.SANDBOX)?.passed,
      scenarioPassRate: (() => {
        const r = last(AuditStage.SCENARIO);
        if (!r) return 0;
        const f = r.findings as any;
        return f?.total > 0 ? f.passed / f.total : 0;
      })(),
      performanceScore: skill.performanceScore,
      adversarialPassed: !!last(AuditStage.ADVERSARIAL)?.passed,
      totalExecutions: skill.totalExecutions,
    };
    const newCert = deriveCertification(summary);
    if (newCert !== skill.certification) {
      await this.prisma.skill.update({ where: { id: skillId }, data: { certification: newCert } });
    }
    return { previous: skill.certification, current: newCert, summary };
  }

  private recordResult(
    skillId: string,
    versionId: string,
    stage: AuditStage,
    passed: boolean,
    findings: Record<string, unknown>,
  ) {
    return this.prisma.auditResult.create({
      data: {
        skillId,
        versionId,
        stage,
        passed,
        riskScore: typeof findings.riskScore === 'number' ? (findings.riskScore as number) : null,
        performanceScore:
          typeof findings.performanceScore === 'number'
            ? (findings.performanceScore as number)
            : null,
        findings: findings as any,
      },
    });
  }

  async listForSkill(skillId: string) {
    return this.prisma.auditResult.findMany({
      where: { skillId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}
