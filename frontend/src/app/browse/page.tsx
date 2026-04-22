import Link from 'next/link';
import { Suspense } from 'react';
import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';
import { SkillCardSkeletonGrid } from '@/components/Skeleton';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';
import { Search } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  { key: '', label: 'All' },
  { key: 'trading', label: 'Trading' },
  { key: 'scraping', label: 'Web data' },
  { key: 'nlp', label: 'Text & language' },
  { key: 'productivity', label: 'Productivity' },
];

const SORTS = [
  { key: 'rating', label: 'Top rated' },
  { key: 'popular', label: 'Most used' },
  { key: 'recent', label: 'New' },
  { key: 'price', label: 'Price' },
];

export default function BrowsePage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const activeCategory = searchParams.category ?? '';
  const activeSort = searchParams.sort ?? 'rating';

  return (
    <div className="space-y-10 pt-6 md:pt-10">
      <header>
        <Eyebrow>Explore</Eyebrow>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Find a skill that works <span className="mute-weight">for you.</span>
        </h1>
        <p className="mt-4 max-w-xl text-base text-fg-secondary md:text-lg">
          Every skill passes an independent audit before it reaches you.
        </p>
      </header>

      <form
        action="/browse"
        method="get"
        className="surface flex items-center gap-2 pl-5 pr-2"
      >
        <input type="hidden" name="category" value={activeCategory} />
        <input type="hidden" name="sort" value={activeSort} />
        <Search className="h-5 w-5 text-fg-muted" />
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="What do you want to automate?"
          className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-fg-muted"
        />
        <Button size="sm" variant="primary" trailingArrow>
          Search
        </Button>
      </form>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => {
            const selected = activeCategory === c.key;
            const params = new URLSearchParams();
            if (c.key) params.set('category', c.key);
            if (searchParams.q) params.set('q', searchParams.q);
            if (activeSort) params.set('sort', activeSort);
            return (
              <Link
                key={c.key || 'all'}
                href={`/browse${params.toString() ? `?${params}` : ''}`}
                className={`rounded-full border px-4 py-1.5 text-xs transition ${
                  selected
                    ? 'border-fg bg-fg text-bg'
                    : 'border-line text-fg-secondary hover:border-line-strong hover:text-fg'
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 text-xs text-fg-muted">
          <span>Sort</span>
          {SORTS.map((s) => {
            const selected = activeSort === s.key;
            const params = new URLSearchParams();
            if (activeCategory) params.set('category', activeCategory);
            if (searchParams.q) params.set('q', searchParams.q);
            params.set('sort', s.key);
            return (
              <Link
                key={s.key}
                href={`/browse?${params}`}
                className={`rounded-full px-2.5 py-1 transition ${
                  selected
                    ? 'bg-accent/10 text-accent-glow'
                    : 'hover:text-fg'
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>

      <Suspense fallback={<SkillCardSkeletonGrid count={8} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const params: Record<string, string> = {};
  if (searchParams.category) params.category = searchParams.category;
  if (searchParams.q) params.q = searchParams.q;
  if (searchParams.sort) params.sort = searchParams.sort;

  let data: Awaited<ReturnType<typeof api.listSkills>> | null = null;
  let error: string | null = null;
  try {
    data = await api.listSkills(params);
  } catch (e: any) {
    error = e.message;
  }

  if (error) {
    return (
      <div className="surface p-6 text-sm text-amber-300">
        Couldn't load skills right now. Please try again in a moment.
      </div>
    );
  }
  if (!data || data.items.length === 0) {
    return (
      <div className="surface flex flex-col items-center p-12 text-center">
        <div className="font-display text-2xl font-semibold">No skills match that.</div>
        <p className="mt-2 max-w-sm text-sm text-fg-secondary">
          Try a different category, or explore top AI skills.
        </p>
        <Button href="/browse" className="mt-6" trailingArrow>
          Reset filters
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="text-xs text-fg-muted">
        {data.total} {data.total === 1 ? 'skill' : 'skills'}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data.items.map((s) => (
          <SkillCard key={s.id} skill={s} />
        ))}
      </div>
    </>
  );
}
