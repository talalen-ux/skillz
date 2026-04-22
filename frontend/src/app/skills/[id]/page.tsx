import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ExecutePanel } from './ExecutePanel';
import { SafetyLabel } from '@/components/SafetyLabel';
import { TrustBadges } from '@/components/TrustBadges';
import { Stars } from '@/components/Stars';
import { Advanced } from '@/components/Advanced';
import {
  formatUsage,
  reliabilityLabel,
  safetyLevel,
  speedLabel,
} from '@/lib/trust';

export const dynamic = 'force-dynamic';

export default async function SkillDetailPage({ params }: { params: { id: string } }) {
  let skill: any;
  try {
    skill = await api.getSkill(params.id);
  } catch {
    notFound();
  }
  const reviews = await api.reviewsForSkill(params.id).catch(() => []);
  const audits = await api.auditForSkill(params.id).catch(() => []);
  const level = safetyLevel(skill);
  const price = Number(skill.price);

  const highlights: string[] = (skill.tags ?? []).slice(0, 4);

  return (
    <div className="space-y-8">
      <Breadcrumbs name={skill.name} />

      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-card-grad p-8">
        <div className="pointer-events-none absolute inset-0 bg-hero-grad opacity-40" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="max-w-xl">
            <div className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {skill.category}
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              {skill.name}
            </h1>
            <p className="mt-4 text-base text-text-secondary">{skill.description}</p>
            <p className="mt-4 text-xs text-text-muted">
              By{' '}
              <Link href={`/creators/${skill.creator.id}`} className="text-text-secondary underline-offset-4 hover:underline">
                {skill.creator.name}
              </Link>
              {' · '}Version {skill.currentVersion ?? 1}
            </p>
          </div>

          <div className="flex flex-col items-start gap-3 md:items-end">
            <SafetyLabel level={level} size="lg" />
            <TrustBadges cert={skill.certification} />
            <div className="mt-2 text-right">
              {skill.isFree ? (
                <div className="text-xl font-semibold text-emerald-400">Free</div>
              ) : (
                <div className="text-xl font-semibold">
                  ${price.toFixed(2)}
                  <span className="text-xs text-text-muted">
                    {' '}
                    {skill.pricingModel === 'SUBSCRIPTION'
                      ? '/ month'
                      : skill.pricingModel === 'PER_EXECUTION'
                      ? '/ run'
                      : ''}
                  </span>
                </div>
              )}
            </div>
            {skill.killSwitch && (
              <span className="rounded-full border border-red-500/50 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-300">
                Paused by admin
              </span>
            )}
          </div>
        </div>
      </section>

      {/* What you get */}
      <Section title="What you get">
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {highlights.length > 0 ? (
            highlights.map((h) => (
              <li key={h} className="glass flex items-start gap-3 p-4">
                <span className="mt-0.5">✨</span>
                <span className="text-sm text-text-primary capitalize">{h}</span>
              </li>
            ))
          ) : (
            <li className="glass p-4 text-sm text-text-secondary">
              Consistent, sandboxed results from a single, simple call.
            </li>
          )}
        </ul>
      </Section>

      {/* Trust & safety + Run side-by-side on desktop */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-3">
          <Section title="Trust & safety">
            <div className="glass p-6">
              <div className="flex flex-wrap items-center gap-3">
                <SafetyLabel level={level} size="lg" />
                <TrustBadges cert={skill.certification} />
              </div>

              <p className="mt-4 max-w-xl text-sm text-text-secondary">
                {level === 'safe'
                  ? 'This skill has passed our automated safety checks. You can try it with confidence.'
                  : level === 'caution'
                  ? 'Some checks found minor issues. Read the permissions carefully before running.'
                  : 'High-risk indicators detected. We recommend avoiding this skill or contacting the creator.'}
              </p>

              <Advanced label="View audit details">
                <div className="space-y-2">
                  {audits.length === 0 ? (
                    <p className="text-xs text-text-muted">No audits on file.</p>
                  ) : (
                    audits.slice(0, 8).map((a: any) => (
                      <details
                        key={a.id}
                        className="rounded-lg border border-line bg-bg-sunken/60 p-3 text-xs"
                      >
                        <summary className="cursor-pointer list-none">
                          <span className="font-mono uppercase text-text-secondary">{a.stage}</span>
                          <span
                            className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                              a.passed
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-red-500/15 text-red-300'
                            }`}
                          >
                            {a.passed ? 'Pass' : 'Fail'}
                          </span>
                        </summary>
                        <pre className="mt-2 max-h-48 overflow-auto rounded bg-bg-sunken p-2 text-[11px] text-text-secondary">
                          {JSON.stringify(a.findings, null, 2)}
                        </pre>
                      </details>
                    ))
                  )}
                </div>
              </Advanced>
            </div>
          </Section>

          <Section title="Performance">
            <div className="grid grid-cols-3 gap-3">
              <Tile
                label="Success rate"
                value={`${Math.round((skill.successRate || 0) * 100)}%`}
                sub={reliabilityLabel(skill.successRate || 0)}
              />
              <Tile
                label="Speed"
                value={speedLabel(skill.avgLatencyMs || 0)}
                sub={skill.avgLatencyMs ? `${skill.avgLatencyMs} ms avg` : undefined}
              />
              <Tile
                label="Used"
                value={`${formatUsage(skill.totalExecutions)}×`}
                sub="times"
              />
            </div>

            <div className="mt-4">
              <Advanced label="View advanced stats">
                <pre className="max-h-56 overflow-auto rounded-xl border border-line bg-bg-sunken/60 p-3 text-[11px] text-text-secondary">
                  {JSON.stringify(
                    {
                      performanceScore: skill.performanceScore,
                      ratingAvg: skill.ratingAvg,
                      ratingCount: skill.ratingCount,
                      totalExecutions: skill.totalExecutions,
                      successRate: skill.successRate,
                      avgLatencyMs: skill.avgLatencyMs,
                      riskScore: skill.riskScore,
                      certification: skill.certification,
                    },
                    null,
                    2,
                  )}
                </pre>
              </Advanced>
            </div>
          </Section>

          <Section title="Reviews">
            <div className="glass p-6">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-semibold">
                      {skill.ratingAvg ? skill.ratingAvg.toFixed(1) : '—'}
                    </span>
                    <Stars value={skill.ratingAvg || 0} size={18} />
                  </div>
                  <p className="mt-1 text-xs text-text-muted">
                    Trusted by {formatUsage(skill.ratingCount || 0)}{' '}
                    {skill.ratingCount === 1 ? 'reviewer' : 'reviewers'}
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {reviews.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-text-secondary">
                    No reviews yet. Run the skill to leave the first one.
                  </li>
                ) : (
                  reviews.slice(0, 5).map((r: any) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-line bg-bg-sunken/40 p-4"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{r.user?.name ?? 'Anonymous'}</span>
                        <Stars value={r.rating} size={12} />
                      </div>
                      {r.body && (
                        <p className="mt-2 text-sm text-text-secondary">{r.body}</p>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </Section>
        </div>

        <aside className="lg:col-span-2">
          <ExecutePanel
            skillId={skill.id}
            skillName={skill.name}
            permissions={skill.permissionsRequired}
            isFree={skill.isFree}
          />
        </aside>
      </div>
    </div>
  );
}

function Breadcrumbs({ name }: { name: string }) {
  return (
    <nav className="text-xs text-text-muted">
      <Link href="/browse" className="hover:text-text-secondary">
        Explore
      </Link>
      <span className="px-2">/</span>
      <span className="text-text-secondary">{name}</span>
    </nav>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="glass p-4">
      <div className="text-[11px] uppercase tracking-wider text-text-muted">{label}</div>
      <div className="mt-1 text-lg font-semibold text-text-primary">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-text-muted">{sub}</div>}
    </div>
  );
}
