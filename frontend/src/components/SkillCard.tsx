import Link from 'next/link';
import type { Skill } from '@/lib/api';
import { formatUsage } from '@/lib/trust';
import { Card } from './ui/Card';
import { Chip } from './ui/Chip';
import { IconTile } from './ui/IconTile';
import { Bookmark, Chart, Shield, Chat, Image, Spark } from './ui/Icons';

function categoryIcon(category?: string) {
  const c = (category ?? '').toLowerCase();
  if (c.includes('trad')) return <Chart className="h-5 w-5" />;
  if (c.includes('scrap') || c.includes('web')) return <Shield className="h-5 w-5" />;
  if (c.includes('nlp') || c.includes('lang') || c.includes('text')) return <Chat className="h-5 w-5" />;
  if (c.includes('product') || c.includes('task')) return <Image className="h-5 w-5" />;
  return <Spark className="h-5 w-5" />;
}

function certToChip(cert: Skill['certification']) {
  // The reference uses a single "VERIFIED" chip for anything past UNVERIFIED.
  // We preserve tier nuance with tooltip-only text so visual remains calm.
  if (cert === 'UNVERIFIED') return null;
  return <Chip tone="neutral">Verified</Chip>;
}

export function SkillCard({ skill }: { skill: Skill }) {
  const runs = formatUsage(skill.totalExecutions);
  return (
    <Card
      href={`/skills/${skill.id}`}
      hover
      className="group relative flex h-full flex-col p-5"
    >
      <header className="flex items-start justify-between gap-3">
        <IconTile size="lg">{categoryIcon(skill.category)}</IconTile>
        <button
          type="button"
          aria-label="Save skill"
          onClick={(e) => {
            e.preventDefault();
          }}
          className="rounded-full border border-line p-1.5 text-fg-muted transition hover:border-line-strong hover:text-fg"
        >
          <Bookmark className="h-4 w-4" />
        </button>
      </header>

      <h3 className="mt-5 font-display text-lg font-semibold leading-tight text-fg md:text-xl">
        {skill.name}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-fg-secondary">{skill.description}</p>

      <footer className="mt-auto flex items-center justify-between pt-5">
        {certToChip(skill.certification) ?? (
          <Chip tone="neutral" className="opacity-70">
            Unverified
          </Chip>
        )}
        <div className="flex items-center gap-2.5 text-xs text-fg-muted">
          <span className="flex items-center gap-1">
            <StarGold />
            <span className="text-fg">
              {skill.ratingAvg ? skill.ratingAvg.toFixed(1) : '—'}
            </span>
          </span>
          <span className="text-fg-dim">·</span>
          <span>{runs} runs</span>
        </div>
      </footer>
    </Card>
  );
}

function StarGold() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden>
      <path
        d="M8 1.5l2 4.4 4.7.6-3.5 3 1.1 4.6L8 11.7 3.7 14l1.1-4.6-3.5-3 4.7-.6L8 1.5z"
        fill="#F5B848"
      />
    </svg>
  );
}
