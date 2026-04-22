import Link from 'next/link';
import { Skill, certBadge } from '@/lib/api';

export function SkillCard({ skill }: { skill: Skill }) {
  const cert = certBadge(skill.certification);
  const price = Number(skill.price);
  return (
    <Link
      href={`/skills/${skill.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-accent hover:shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold">{skill.name}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-zinc-600">{skill.description}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ${cert.color}`}>
          {cert.label}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {skill.tags?.slice(0, 4).map((t) => (
          <span key={t} className="rounded bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-700">
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>
          ★ {skill.ratingAvg.toFixed(1)} ({skill.ratingCount}) · {skill.totalExecutions} runs
        </span>
        <span className="font-medium text-zinc-800">
          {skill.isFree ? 'Free' : `$${price.toFixed(2)} / ${skill.pricingModel.toLowerCase()}`}
        </span>
      </div>
    </Link>
  );
}
