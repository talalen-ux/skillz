import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';
import { Stars } from '@/components/Stars';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Chip } from '@/components/ui/Chip';
import { IconTile } from '@/components/ui/IconTile';
import { formatUsage } from '@/lib/trust';

export const dynamic = 'force-dynamic';

export default async function CreatorPage({ params }: { params: { id: string } }) {
  let c: any;
  try {
    c = await api.getCreator(params.id);
  } catch {
    notFound();
  }
  const verified = c.stats.auditPassRate >= 0.8 && c.stats.totalSkills >= 1;

  return (
    <div className="space-y-10 pt-6 md:pt-10">
      <header className="surface-glow p-8 md:p-10">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <IconTile size="lg" className="h-16 w-16 text-xl font-semibold text-fg">
              {(c.name?.[0] ?? '?').toUpperCase()}
            </IconTile>
            <div>
              <Eyebrow>Creator</Eyebrow>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-5xl">
                {c.name}
              </h1>
              <p className="mt-2 max-w-xl text-sm text-fg-secondary md:text-base">
                {c.bio ?? 'Skill creator on Skillz.'}
              </p>
            </div>
          </div>
          {verified && <Chip tone="accent">Verified creator</Chip>}
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Skills" value={c.stats.totalSkills} />
        <Stat label="Users served" value={formatUsage(c.stats.totalExecutions)} />
        <Stat
          label="Rating"
          value={c.stats.avgRating ? c.stats.avgRating.toFixed(1) : '—'}
          extra={<Stars value={c.stats.avgRating || 0} size={12} />}
        />
        <Stat
          label="Pass rate"
          value={`${Math.round((c.stats.auditPassRate || 0) * 100)}%`}
          sub="of safety checks"
        />
      </section>

      <section>
        <Eyebrow>Skills by {c.name}</Eyebrow>
        <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight md:text-3xl">
          Published work.
        </h2>
        {c.skills.length === 0 ? (
          <div className="surface mt-5 p-12 text-center text-sm text-fg-secondary">
            This creator hasn't published any skills yet.
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {c.skills.map((s: any) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  extra,
}: {
  label: string;
  value: string | number;
  sub?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="surface p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">{label}</div>
      <div className="mt-2 flex items-baseline gap-2">
        <div className="font-display text-xl font-semibold text-fg md:text-2xl">{value}</div>
        {extra}
      </div>
      {sub && <div className="mt-1 text-xs text-fg-muted">{sub}</div>}
    </div>
  );
}
