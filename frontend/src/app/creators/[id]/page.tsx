import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';
import { Stars } from '@/components/Stars';
import { formatUsage } from '@/lib/trust';

export const dynamic = 'force-dynamic';

export default async function CreatorPage({ params }: { params: { id: string } }) {
  const c: any = await api.getCreator(params.id);
  const verified = c.stats.auditPassRate >= 0.8 && c.stats.totalSkills >= 1;

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-3xl border border-line bg-card-grad p-8">
        <div className="pointer-events-none absolute inset-0 bg-hero-grad opacity-30" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-line bg-bg-sunken text-lg font-semibold">
              {c.name?.[0] ?? '?'}
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{c.name}</h1>
              <p className="mt-1 text-sm text-text-secondary">
                {c.bio ?? 'Skill creator on Skillz.'}
              </p>
            </div>
          </div>
          {verified && (
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
              ✅ Verified creator
            </span>
          )}
        </div>
      </header>

      {/* Clean trust row */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Skills" value={c.stats.totalSkills} />
        <Stat
          label="Users served"
          value={formatUsage(c.stats.totalExecutions)}
        />
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
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Skills by {c.name}</h2>
        {c.skills.length === 0 ? (
          <div className="glass p-8 text-center text-sm text-text-secondary">
            This creator hasn't published any skills yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="glass p-5">
      <div className="text-[11px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="text-xl font-semibold">{value}</div>
        {extra}
      </div>
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
    </div>
  );
}
