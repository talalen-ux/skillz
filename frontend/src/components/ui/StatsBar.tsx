import * as React from 'react';
import { IconTile } from './IconTile';

export type Stat = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

/**
 * The horizontal 5-across stats strip from the reference. Each stat is an
 * IconTile + number + label. Hairline vertical separators between items.
 * Collapses to a 2-col grid on mobile, 5-col on desktop.
 */
export function StatsBar({ stats }: { stats: Stat[] }) {
  return (
    <div className="surface overflow-hidden">
      <div className="grid grid-cols-2 divide-x divide-y divide-line md:grid-cols-5 md:divide-y-0">
        {stats.map((s, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 p-5 md:p-6 ${i === 0 ? 'md:border-l-0' : ''}`}
          >
            <IconTile size="md">{s.icon}</IconTile>
            <div className="min-w-0">
              <div className="font-display text-xl font-semibold leading-none text-fg md:text-[22px]">
                {s.value}
              </div>
              <div className="mt-1.5 truncate text-xs text-fg-muted">{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
