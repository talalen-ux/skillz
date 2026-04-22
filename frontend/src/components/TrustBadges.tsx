import type { Skill } from '@/lib/api';
import { trustBadges } from '@/lib/trust';

export function TrustBadges({
  cert,
  compact = false,
}: {
  cert: Skill['certification'];
  compact?: boolean;
}) {
  const badges = trustBadges(cert);
  if (badges.length === 0) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full border border-line px-2 py-0.5 text-[11px] text-text-muted"
        title="Not yet verified — try at your own discretion."
      >
        <span>⚠</span> Not verified
      </span>
    );
  }
  return (
    <div className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-2'}`}>
      {badges.map((b) => (
        <span
          key={b.label}
          title={b.tooltip}
          className={`inline-flex items-center gap-1 rounded-full border border-line bg-white/[0.03] ${
            compact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } text-text-secondary`}
        >
          <span aria-hidden>{b.icon}</span>
          <span>{b.label}</span>
        </span>
      ))}
    </div>
  );
}
