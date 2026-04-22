import Link from 'next/link';
import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';

export const dynamic = 'force-dynamic';

const CATEGORIES = ['trading', 'scraping', 'nlp', 'productivity'];
const CERTS = [
  'UNVERIFIED',
  'FUNCTION_VERIFIED',
  'PERFORMANCE_VERIFIED',
  'SECURITY_AUDITED',
  'BATTLE_TESTED',
];

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const params: Record<string, string> = {};
  if (searchParams.category) params.category = searchParams.category;
  if (searchParams.q) params.q = searchParams.q;
  if (searchParams.certification) params.certification = searchParams.certification;
  if (searchParams.sort) params.sort = searchParams.sort;
  let data: Awaited<ReturnType<typeof api.listSkills>> | null = null;
  let error: string | null = null;
  try {
    data = await api.listSkills(params);
  } catch (e: any) {
    error = e.message;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Browse skills</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Filter by category, certification tier, or search by name.
        </p>
      </div>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-zinc-200 bg-white p-4">
        <label className="flex flex-col text-xs text-zinc-600">
          Search
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="trading, summariser…"
            className="mt-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          />
        </label>
        <label className="flex flex-col text-xs text-zinc-600">
          Category
          <select
            name="category"
            defaultValue={searchParams.category ?? ''}
            className="mt-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          >
            <option value="">all</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs text-zinc-600">
          Certification
          <select
            name="certification"
            defaultValue={searchParams.certification ?? ''}
            className="mt-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          >
            <option value="">all</option>
            {CERTS.map((c) => (
              <option key={c} value={c}>{c.toLowerCase().replace(/_/g, ' ')}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-xs text-zinc-600">
          Sort
          <select
            name="sort"
            defaultValue={searchParams.sort ?? 'rating'}
            className="mt-1 rounded-md border border-zinc-300 px-3 py-1.5 text-sm"
          >
            <option value="rating">rating</option>
            <option value="recent">recent</option>
            <option value="popular">popular</option>
            <option value="price">price</option>
          </select>
        </label>
        <button className="rounded-md bg-ink px-4 py-1.5 text-sm font-medium text-white">Apply</button>
        <Link href="/browse" className="text-xs text-zinc-500 underline">reset</Link>
      </form>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {data && data.items.length === 0 && (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          No skills match those filters.
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}
