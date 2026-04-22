import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';

export const dynamic = 'force-dynamic';

export default async function CreatorPage({ params }: { params: { id: string } }) {
  const c = await api.getCreator(params.id);
  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h1 className="text-2xl font-bold">{c.name}</h1>
        {c.bio && <p className="mt-2 max-w-xl text-sm text-zinc-700">{c.bio}</p>}
      </header>
      <section className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <Stat label="Skills" value={c.stats.totalSkills} />
        <Stat label="Executions" value={c.stats.totalExecutions.toLocaleString()} />
        <Stat label="Avg rating" value={`★ ${c.stats.avgRating.toFixed(1)}`} />
        <Stat label="Audit pass rate" value={`${(c.stats.auditPassRate * 100).toFixed(0)}%`} />
        <Stat label="Est. revenue" value={`$${c.stats.estimatedRevenue.toFixed(2)}`} />
      </section>
      <section>
        <h2 className="mb-3 text-lg font-semibold">Skills</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {c.skills.map((s: any) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
