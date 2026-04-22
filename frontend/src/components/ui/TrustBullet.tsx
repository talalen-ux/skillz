import * as React from 'react';

/**
 * Horizontal icon + label used below hero CTAs — the
 * "🛡 Every skill is audited · ✓ Independently verified · 💳 Pay only for results"
 * row from the reference.
 */
export function TrustBullet({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-fg-secondary">
      <span className="text-fg-muted">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
