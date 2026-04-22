import Link from 'next/link';
import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let featured: Awaited<ReturnType<typeof api.listSkills>> | null = null;
  try {
    featured = await api.listSkills({ sort: 'rating', limit: '6' });
  } catch (e) {
    // Backend down or empty — render the empty state.
  }
  return (
    <div className="space-y-12">
      <section className="rounded-2xl border border-zinc-200 bg-white p-10">
        <h1 className="text-3xl font-bold tracking-tight">Audited AI agent skills.</h1>
        <p className="mt-3 max-w-xl text-zinc-600">
          Discover, run, and review skills that have been statically analyzed,
          sandbox-tested, and adversarially probed. Buy with confidence.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/browse"
            className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Browse skills
          </Link>
          <Link
            href="/free"
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:border-accent"
          >
            Free Hub
          </Link>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <h2 className="text-xl font-semibold">Featured</h2>
          <Link href="/browse" className="text-sm text-accent">View all →</Link>
        </div>
        {!featured || featured.items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
            No skills yet. Backend may be unreachable, or run the seed script.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured.items.map((s) => (
              <SkillCard key={s.id} skill={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
