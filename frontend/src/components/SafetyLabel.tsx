import type { SafetyLevel } from '@/lib/trust';
import { safetyCopy } from '@/lib/trust';

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
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
      : color === 'trust-caution'
      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
      : 'bg-red-500/10 text-red-400 border-red-500/30';
  const dot =
    color === 'trust-safe'
      ? 'bg-emerald-400'
      : color === 'trust-caution'
      ? 'bg-amber-400'
      : 'bg-red-400';
  const sz =
    size === 'lg'
      ? 'px-3 py-1.5 text-sm'
      : size === 'sm'
      ? 'px-2 py-0.5 text-[11px]'
      : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border font-medium ${tone} ${sz}`}
      title={label}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
