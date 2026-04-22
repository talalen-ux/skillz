import Link from 'next/link';
import { Suspense } from 'react';
import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';
import { SkillCardSkeletonGrid } from '@/components/Skeleton';

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
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Explore skills</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Find a skill to automate what you don't want to do yourself.
        </p>
      </header>

      {/* Search */}
      <form action="/browse" method="get" className="glass flex items-center gap-2 p-2">
        <input
          type="hidden"
          name="category"
          value={activeCategory}
        />
        <input
          type="hidden"
          name="sort"
          value={activeSort}
        />
        <svg width="18" height="18" viewBox="0 0 20 20" className="ml-3 text-text-muted">
          <path
            d="M9 2a7 7 0 105.4 11.5l3.3 3.3a1 1 0 001.4-1.4l-3.3-3.3A7 7 0 009 2zm0 2a5 5 0 110 10A5 5 0 019 4z"
            fill="currentColor"
          />
        </svg>
        <input
          name="q"
          defaultValue={searchParams.q ?? ''}
          placeholder="What do you want to automate?"
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-text-muted"
        />
        <button className="btn-primary !py-1.5 !px-4 !text-xs">Search</button>
      </form>

      {/* Category + sort pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
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
                className={`rounded-full border px-3 py-1.5 text-xs transition ${
                  selected
                    ? 'border-white bg-white text-bg-base'
                    : 'border-line text-text-secondary hover:border-line-strong hover:text-text-primary'
                }`}
              >
                {c.label}
              </Link>
            );
          })}
        </div>
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <span>Sort by</span>
          <div className="flex gap-1">
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
                  className={`rounded-full border px-2.5 py-1 transition ${
                    selected
                      ? 'border-brand-500/60 bg-brand-500/10 text-brand-400'
                      : 'border-transparent hover:text-text-primary'
                  }`}
                >
                  {s.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <Suspense fallback={<SkillCardSkeletonGrid count={9} />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Results({ searchParams }: { searchParams: Record<string, string | undefined> }) {
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
      <div className="glass p-6 text-sm text-amber-300">
        Couldn't load skills right now. Please try again in a moment.
      </div>
    );
  }
  if (!data || data.items.length === 0) {
    return (
      <div className="glass flex flex-col items-center p-10 text-center">
        <div className="text-3xl">🔎</div>
        <h3 className="mt-3 text-base font-semibold">No skills match that.</h3>
        <p className="mt-1 max-w-sm text-sm text-text-secondary">
          Try a different category, or{' '}
          <Link href="/browse" className="underline underline-offset-4">
            explore top AI skills
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-xs text-text-muted">
        {data.total} {data.total === 1 ? 'skill' : 'skills'}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.items.map((s) => (
          <SkillCard key={s.id} skill={s} />
        ))}
      </div>
    </>
  );
}
