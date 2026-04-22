import type { SafetyLevel } from '@/lib/trust';
import { safetyCopy } from '@/lib/trust';

/**
 * Safety semantics stay green/amber/red — these are load-bearing, not decorative.
 * Visual treatment (pill shape, hairline border) matches the rest of the system.
 */
export function SafetyLabel({
  level,
  size = 'md',
}: {
  level: SafetyLevel;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { label, color } = safetyCopy(level);
  const tone =
    color === 'trust-safe'
      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
      : color === 'trust-caution'
      ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
      : 'border-red-500/40 bg-red-500/10 text-red-300';
  const dot =
    color === 'trust-safe'
      ? 'bg-emerald-400'
      : color === 'trust-caution'
      ? 'bg-amber-400'
      : 'bg-red-400';
  const sz =
    size === 'lg'
      ? 'px-3 py-1.5 text-xs'
      : size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-1 text-[11px]';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-medium uppercase tracking-[0.15em] ${tone} ${sz}`}
      title={label}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
