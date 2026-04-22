import Link from 'next/link';
import { Suspense } from 'react';
import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';
import { SkillCardSkeletonGrid } from '@/components/Skeleton';

export const dynamic = 'force-dynamic';

export default function FreeHubPage() {
  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-2xl border border-line bg-card-grad p-8">
        <div className="pointer-events-none absolute inset-0 bg-hero-grad opacity-60" />
        <div className="relative">
          <span className="chip border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            🆓 Always free
          </span>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">Try skills for free</h1>
          <p className="mt-2 max-w-xl text-sm text-text-secondary">
            Hand-picked, free-to-run skills. No card needed. A great way to see what skills feel
            like before you upgrade.
          </p>
        </div>
      </header>

      <Suspense fallback={<SkillCardSkeletonGrid count={6} />}>
        <FreeList />
      </Suspense>
    </div>
  );
}

async function FreeList() {
  try {
    const { items } = await api.listSkills({
      pricingModel: 'FREE',
      sort: 'popular',
      limit: '24',
    });
    if (items.length === 0) {
      return (
        <div className="glass flex flex-col items-center p-10 text-center">
          <div className="text-3xl">🎁</div>
          <h3 className="mt-3 text-base font-semibold">No free skills yet</h3>
          <p className="mt-1 text-sm text-text-secondary">Check back soon.</p>
          <Link href="/browse" className="btn-secondary mt-5">
            Explore all skills
          </Link>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <SkillCard key={s.id} skill={s} />
        ))}
      </div>
    );
  } catch {
    return (
      <div className="glass p-6 text-sm text-amber-300">
        Couldn't load free skills right now. Please try again in a moment.
      </div>
    );
  }
}
