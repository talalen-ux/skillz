import type { Skill } from './api';

export type SafetyLevel = 'safe' | 'caution' | 'risk';

export function safetyLevel(skill: Pick<Skill, 'riskScore' | 'killSwitch' | 'isDisabled'>): SafetyLevel {
  if (skill.killSwitch || skill.isDisabled) return 'risk';
  if (skill.riskScore < 30) return 'safe';
  if (skill.riskScore < 60) return 'caution';
  return 'risk';
}

export function safetyCopy(level: SafetyLevel) {
  if (level === 'safe') return { label: 'Safe to use', color: 'trust-safe', dot: '🟢' };
  if (level === 'caution') return { label: 'Use with caution', color: 'trust-caution', dot: '🟡' };
  return { label: 'High risk', color: 'trust-risk', dot: '🔴' };
}

/** Human-friendly badges derived from certification tier. */
export function trustBadges(cert: Skill['certification']): {
  icon: string;
  label: string;
  tooltip: string;
}[] {
  const all = {
    verified: { icon: '✅', label: 'Verified', tooltip: 'Works as expected in our tests.' },
    safe: { icon: '🔒', label: 'Safe', tooltip: 'Security checked against common attacks.' },
    perf: { icon: '⚡', label: 'High performance', tooltip: 'Passed performance benchmarks.' },
    battle: { icon: '🏆', label: 'Battle tested', tooltip: 'Proven reliable across many real runs.' },
  };
  switch (cert) {
    case 'BATTLE_TESTED':
      return [all.verified, all.safe, all.perf, all.battle];
    case 'SECURITY_AUDITED':
      return [all.verified, all.safe, all.perf];
    case 'PERFORMANCE_VERIFIED':
      return [all.verified, all.perf];
    case 'FUNCTION_VERIFIED':
      return [all.verified];
    default:
      return [];
  }
}

export function formatUsage(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`;
  return n.toString();
}

/** Friendly speed description from latency ms. */
export function speedLabel(ms: number) {
  if (!ms) return 'Not measured';
  if (ms < 300) return 'Fast';
  if (ms < 1000) return 'Quick';
  if (ms < 3000) return 'Average';
  return 'Slow';
}

export function reliabilityLabel(successRate: number) {
  if (successRate >= 0.95) return 'Very reliable';
  if (successRate >= 0.85) return 'Reliable';
  if (successRate >= 0.7) return 'Mostly reliable';
  return 'Inconsistent';
}

export type FriendlyPermission = {
  key: string;
  label: string;
  allowed: boolean;
  /** Whether an "allowed" state is reassuring (true) or concerning (false). */
  goodWhenAllowed: boolean;
  detail?: string;
};

/**
 * Turn the raw permission JSON into a short, reassurance-focused list a
 * non-technical user can scan before hitting "Run".
 */
export function describePermissions(raw: Record<string, any> | undefined | null): FriendlyPermission[] {
  const p = raw ?? {};
  const domains: string[] = Array.isArray(p.allowedDomains) ? p.allowedDomains : [];
  const actions: string[] = Array.isArray(p.allowedActions) ? p.allowedActions : [];
  const walletAccess = !!p.walletAccess;
  const maxSpend = Number(p.maxSpendUsd ?? 0);
  const canSpend = walletAccess && maxSpend > 0;
  const maxCalls = Number(p.maxApiCalls ?? 0);

  return [
    {
      key: 'wallet',
      label: walletAccess ? 'Access your wallet' : 'Cannot access your wallet',
      allowed: walletAccess,
      goodWhenAllowed: false,
      detail: walletAccess ? 'This skill can read wallet-related data you provide.' : undefined,
    },
    {
      key: 'send',
      label: canSpend ? `Can spend up to $${maxSpend.toFixed(2)}` : 'Cannot move your funds',
      allowed: canSpend,
      goodWhenAllowed: false,
    },
    {
      key: 'network',
      label:
        domains.length === 0
          ? 'No internet access'
          : `Reads data from: ${domains.slice(0, 3).join(', ')}${domains.length > 3 ? '…' : ''}`,
      allowed: domains.length > 0,
      goodWhenAllowed: true,
      detail: maxCalls > 0 ? `Up to ${maxCalls} requests per run.` : undefined,
    },
    {
      key: 'actions',
      label:
        actions.length === 0
          ? 'No external actions'
          : `Can perform: ${actions.slice(0, 3).join(', ')}${actions.length > 3 ? '…' : ''}`,
      allowed: actions.length > 0,
      goodWhenAllowed: true,
    },
  ];
}
