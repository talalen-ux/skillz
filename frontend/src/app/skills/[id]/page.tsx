import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';
import { ExecutePanel } from './ExecutePanel';
import { SafetyLabel } from '@/components/SafetyLabel';
import { TrustBadges } from '@/components/TrustBadges';
import { Stars } from '@/components/Stars';
import { Advanced } from '@/components/Advanced';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Chip } from '@/components/ui/Chip';
import { IconTile } from '@/components/ui/IconTile';
import { Spark } from '@/components/ui/Icons';
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

  return (
    <div className="space-y-10 pt-4 md:pt-8">
      <nav className="text-xs text-fg-muted">
        <Link href="/browse" className="hover:text-fg">
          Explore
        </Link>
        <span className="px-2 text-fg-dim">/</span>
        <span className="text-fg-secondary">{skill.name}</span>
      </nav>

      {/* Hero */}
      <section className="surface-glow p-8 md:p-10">
        <div className="relative flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <Eyebrow>{skill.category}</Eyebrow>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
              {skill.name}
            </h1>
            <p className="mt-5 max-w-2xl text-base text-fg-secondary md:text-lg">
              {skill.description}
            </p>
            <p className="mt-5 text-xs text-fg-muted">
              By{' '}
              <Link
                href={`/creators/${skill.creator.id}`}
                className="text-fg-secondary underline-offset-4 hover:text-fg hover:underline"
              >
                {skill.creator.name}
              </Link>
              <span className="px-2 text-fg-dim">·</span>
              Version {skill.currentVersion ?? 1}
            </p>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
            <SafetyLabel level={level} size="lg" />
            <TrustBadges cert={skill.certification} />
            <div className="text-right">
              {skill.isFree ? (
                <div className="font-display text-2xl font-semibold text-fg">Free</div>
              ) : (
                <div className="font-display text-2xl font-semibold text-fg">
                  ${price.toFixed(2)}
                  <span className="ml-1 text-xs font-normal text-fg-muted">
                    {skill.pricingModel === 'SUBSCRIPTION'
                      ? '/month'
                      : skill.pricingModel === 'PER_EXECUTION'
                      ? '/run'
                      : ''}
                  </span>
                </div>
              )}
            </div>
            {skill.killSwitch && (
              <Chip tone="risk">Paused by admin</Chip>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="space-y-10 lg:col-span-3">
          {/* What you get */}
          <section>
            <Eyebrow>What you get</Eyebrow>
            <ul className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {(skill.tags?.length ? skill.tags.slice(0, 4) : ['Consistent results']).map(
                (h: string) => (
                  <li
                    key={h}
                    className="surface flex items-start gap-3 p-4 capitalize"
                  >
                    <IconTile size="sm">
                      <Spark className="h-4 w-4" />
                    </IconTile>
                    <span className="mt-1 text-sm text-fg">{h}</span>
                  </li>
                ),
              )}
            </ul>
          </section>

          {/* Trust & safety */}
          <section>
            <Eyebrow>Trust & safety</Eyebrow>
            <div className="surface mt-5 p-6">
              <div className="flex flex-wrap items-center gap-3">
                <SafetyLabel level={level} size="lg" />
                <TrustBadges cert={skill.certification} />
              </div>
              <p className="mt-4 max-w-xl text-sm text-fg-secondary md:text-base">
                {level === 'safe'
                  ? 'This skill has passed our automated safety checks. You can try it with confidence.'
                  : level === 'caution'
                  ? 'Some checks found minor issues. Read the permissions carefully before running.'
                  : 'High-risk indicators detected. We recommend avoiding this skill or contacting the creator.'}
              </p>
              <div className="mt-5">
                <Advanced label="View audit details">
                  <div className="space-y-2">
                    {audits.length === 0 ? (
                      <p className="text-xs text-fg-muted">No audits on file.</p>
                    ) : (
                      audits.slice(0, 8).map((a: any) => (
                        <details
                          key={a.id}
                          className="rounded-xl border border-line bg-bg p-3 text-xs"
                        >
                          <summary className="cursor-pointer list-none">
                            <span className="font-mono uppercase text-fg-secondary">
                              {a.stage}
                            </span>
                            <span
                              className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                                a.passed
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : 'bg-red-500/15 text-red-300'
                              }`}
                            >
                              {a.passed ? 'Pass' : 'Fail'}
                            </span>
                          </summary>
                          <pre className="mt-2 max-h-48 overflow-auto rounded bg-bg-sunken p-2 text-[11px] text-fg-secondary">
                            {JSON.stringify(a.findings, null, 2)}
                          </pre>
                        </details>
                      ))
                    )}
                  </div>
                </Advanced>
              </div>
            </div>
          </section>

          {/* Performance */}
          <section>
            <Eyebrow>Performance</Eyebrow>
            <div className="mt-5 grid grid-cols-3 gap-3">
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
                <pre className="max-h-56 overflow-auto rounded-xl border border-line bg-bg p-3 text-[11px] text-fg-secondary">
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
          </section>

          {/* Reviews */}
          <section>
            <Eyebrow>Reviews</Eyebrow>
            <div className="surface mt-5 p-6">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-semibold text-fg">
                      {skill.ratingAvg ? skill.ratingAvg.toFixed(1) : '—'}
                    </span>
                    <Stars value={skill.ratingAvg || 0} size={18} />
                  </div>
                  <p className="mt-1 text-xs text-fg-muted">
                    Trusted by {formatUsage(skill.ratingCount || 0)}{' '}
                    {skill.ratingCount === 1 ? 'reviewer' : 'reviewers'}
                  </p>
                </div>
              </div>

              <ul className="mt-6 space-y-3">
                {reviews.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-fg-secondary">
                    No reviews yet. Run the skill to leave the first one.
                  </li>
                ) : (
                  reviews.slice(0, 5).map((r: any) => (
                    <li
                      key={r.id}
                      className="rounded-xl border border-line bg-bg p-4"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-fg">
                          {r.user?.name ?? 'Anonymous'}
                        </span>
                        <Stars value={r.rating} size={12} />
                      </div>
                      {r.body && <p className="mt-2 text-sm text-fg-secondary">{r.body}</p>}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </section>
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

function Tile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="surface p-5">
      <div className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">{label}</div>
      <div className="mt-2 font-display text-xl font-semibold text-fg md:text-2xl">
        {value}
      </div>
      {sub && <div className="mt-1 text-xs text-fg-muted">{sub}</div>}
    </div>
  );
}
