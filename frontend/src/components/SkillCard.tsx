import Link from 'next/link';
import type { Skill } from '@/lib/api';
import { Stars } from './Stars';
import { SafetyLabel } from './SafetyLabel';
import { TrustBadges } from './TrustBadges';
import { formatUsage, safetyLevel } from '@/lib/trust';

export function SkillCard({ skill }: { skill: Skill }) {
  const level = safetyLevel(skill);
  const price = Number(skill.price);
  return (
    <Link
      href={`/skills/${skill.id}`}
      className="group block rounded-2xl border border-line bg-card-grad p-5 transition hover:border-line-strong hover:shadow-glow"
    >
      {/* Top row: name + category chip */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            {skill.category}
          </div>
          <h3 className="mt-1 truncate text-base font-semibold text-text-primary group-hover:text-white">
            {skill.name}
          </h3>
        </div>
        <SafetyLabel level={level} size="sm" />
      </div>

      {/* Middle: plain-English description */}
      <p className="mt-2.5 line-clamp-2 text-sm text-text-secondary">{skill.description}</p>

      {/* Trust row */}
      <div className="mt-4">
        <TrustBadges cert={skill.certification} compact />
      </div>

      {/* Bottom: rating + usage + price + CTA */}
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="inline-flex items-center gap-1.5">
            <Stars value={skill.ratingAvg} size={12} />
            <span className="text-text-secondary">{skill.ratingAvg.toFixed(1)}</span>
          </span>
          <span className="text-text-muted">
            Used {formatUsage(skill.totalExecutions)} times
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">
            {skill.isFree ? (
              <span className="text-emerald-400">Free</span>
            ) : skill.pricingModel === 'SUBSCRIPTION' ? (
              <span>
                ${price.toFixed(2)}
                <span className="text-xs text-text-muted"> /mo</span>
              </span>
            ) : skill.pricingModel === 'PER_EXECUTION' ? (
              <span>
                ${price.toFixed(2)}
                <span className="text-xs text-text-muted"> /run</span>
              </span>
            ) : (
              <span>${price.toFixed(2)}</span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
