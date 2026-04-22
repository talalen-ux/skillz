import { CertificationStatus } from '@prisma/client';

export interface AuditSummary {
  staticPassed: boolean;
  staticRiskScore: number;
  sandboxPassed: boolean;
  scenarioPassRate: number; // 0..1
  performanceScore: number; // 0..100
  adversarialPassed: boolean;
  totalExecutions: number;
}

/**
 * Deterministic ladder. Each tier requires the prior tier's evidence.
 *  - UNVERIFIED:           default
 *  - FUNCTION_VERIFIED:    static + sandbox passed
 *  - PERFORMANCE_VERIFIED: + scenarios >=0.8 + perf >=70
 *  - SECURITY_AUDITED:     + adversarial passed + static risk <30
 *  - BATTLE_TESTED:        + >=100 real executions + perf >=85
 */
export function deriveCertification(s: AuditSummary): CertificationStatus {
  if (!s.staticPassed || !s.sandboxPassed) return CertificationStatus.UNVERIFIED;
  let tier: CertificationStatus = CertificationStatus.FUNCTION_VERIFIED;
  if (s.scenarioPassRate >= 0.8 && s.performanceScore >= 70) {
    tier = CertificationStatus.PERFORMANCE_VERIFIED;
  }
  if (tier === CertificationStatus.PERFORMANCE_VERIFIED && s.adversarialPassed && s.staticRiskScore < 30) {
    tier = CertificationStatus.SECURITY_AUDITED;
  }
  if (tier === CertificationStatus.SECURITY_AUDITED && s.totalExecutions >= 100 && s.performanceScore >= 85) {
    tier = CertificationStatus.BATTLE_TESTED;
  }
  return tier;
}
