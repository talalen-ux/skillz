import Link from 'next/link';
import { api, certBadge } from '@/lib/api';
import { ExecutePanel } from './ExecutePanel';

export const dynamic = 'force-dynamic';

export default async function SkillDetailPage({ params }: { params: { id: string } }) {
  const skill = await api.getSkill(params.id);
  const reviews = await api.reviewsForSkill(params.id).catch(() => []);
  const audits = await api.auditForSkill(params.id).catch(() => []);
  const cert = certBadge(skill.certification);
  const price = Number(skill.price);

  return (
    <div className="space-y-8">
      <header className="rounded-2xl border border-zinc-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500">{skill.category}</div>
            <h1 className="mt-1 text-2xl font-bold">{skill.name}</h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-700">{skill.description}</p>
            <p className="mt-3 text-xs text-zinc-500">
              by{' '}
              <Link href={`/creators/${skill.creator.id}`} className="text-accent">
                {skill.creator.name}
              </Link>{' '}
              · v{skill.currentVersion ?? 1}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-right">
            <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white ${cert.color}`}>
              {cert.label}
            </span>
            <div className="text-sm">
              {skill.isFree ? (
                <span className="font-semibold text-emerald-700">Free</span>
              ) : (
                <span className="font-semibold">
                  ${price.toFixed(2)} <span className="text-xs text-zinc-500">/ {skill.pricingModel.toLowerCase()}</span>
                </span>
              )}
            </div>
            {skill.killSwitch && (
              <span className="rounded bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">
                KILL-SWITCH ON
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat label="Rating" value={`★ ${skill.ratingAvg.toFixed(1)}`} sub={`${skill.ratingCount} reviews`} />
        <Stat label="Executions" value={skill.totalExecutions.toLocaleString()} />
        <Stat label="Success rate" value={`${(skill.successRate * 100).toFixed(0)}%`} />
        <Stat label="Avg latency" value={`${skill.avgLatencyMs} ms`} />
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ExecutePanel skillId={skill.id} />

        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <h3 className="mb-3 font-semibold">Required permissions</h3>
          <pre className="max-h-64 overflow-auto rounded bg-zinc-50 p-3 text-xs">
            {JSON.stringify(skill.permissionsRequired, null, 2)}
          </pre>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Audit results</h2>
        {audits.length === 0 ? (
          <p className="text-sm text-zinc-500">No audits run yet.</p>
        ) : (
          <ul className="space-y-2">
            {audits.slice(0, 10).map((a: any) => (
              <li key={a.id} className="rounded border border-zinc-200 bg-white p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase">{a.stage}</span>
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-bold text-white ${
                      a.passed ? 'bg-emerald-600' : 'bg-red-600'
                    }`}
                  >
                    {a.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
                <pre className="mt-2 max-h-48 overflow-auto rounded bg-zinc-50 p-2 text-[11px]">
                  {JSON.stringify(a.findings, null, 2)}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="text-sm text-zinc-500">No reviews yet. Run the skill to leave one.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map((r: any) => (
              <li key={r.id} className="rounded border border-zinc-200 bg-white p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.user?.name ?? 'Anon'}</span>
                  <span>{'★'.repeat(r.rating)}<span className="text-zinc-300">{'★'.repeat(5 - r.rating)}</span></span>
                </div>
                {r.body && <p className="mt-1 text-zinc-700">{r.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div className="mt-1 text-xl font-bold">{value}</div>
      {sub && <div className="text-xs text-zinc-500">{sub}</div>}
    </div>
  );
}
