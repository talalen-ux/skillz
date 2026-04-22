/**
 * Skill permission manifest declared by creators and enforced by the sandbox.
 * The backend validates the *shape* and bounds; the sandbox enforces at runtime.
 */
export interface SkillPermissions {
  /** Hostnames the skill is allowed to call. Empty = no network. */
  allowedDomains?: string[];
  /** Allowed action verbs (free-form, e.g. "read_market_data", "send_email"). */
  allowedActions?: string[];
  /** Hard cap on requests per execution. */
  maxApiCalls?: number;
  /** For financial skills: maximum spend per execution in USD-equiv. */
  maxSpendUsd?: number;
  /** Whether the skill may access a wallet. Off by default. */
  walletAccess?: boolean;
  /** Sandbox runtime limits. */
  timeoutSec?: number;
  memoryMb?: number;
}

const HARD_LIMITS = {
  maxApiCalls: 50,
  maxSpendUsd: 1000,
  timeoutSec: 60,
  memoryMb: 1024,
};

export function normalizePermissions(p: SkillPermissions | undefined): SkillPermissions {
  const perms: SkillPermissions = {
    allowedDomains: (p?.allowedDomains ?? []).map((d) => d.toLowerCase().trim()).filter(Boolean),
    allowedActions: p?.allowedActions ?? [],
    maxApiCalls: Math.min(p?.maxApiCalls ?? 10, HARD_LIMITS.maxApiCalls),
    maxSpendUsd: Math.min(p?.maxSpendUsd ?? 0, HARD_LIMITS.maxSpendUsd),
    walletAccess: !!p?.walletAccess,
    timeoutSec: Math.min(p?.timeoutSec ?? 15, HARD_LIMITS.timeoutSec),
    memoryMb: Math.min(p?.memoryMb ?? 256, HARD_LIMITS.memoryMb),
  };
  return perms;
}

/** Checks whether a requested execution input is permitted. */
export function validateInputs(
  perms: SkillPermissions,
  inputs: Record<string, unknown>,
): { ok: boolean; reason?: string } {
  if (typeof inputs !== 'object' || inputs === null) {
    return { ok: false, reason: 'inputs must be an object' };
  }
  if (!perms.walletAccess && (inputs as any).walletKey) {
    return { ok: false, reason: 'wallet access not permitted' };
  }
  return { ok: true };
}
