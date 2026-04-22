import { Suspense } from 'react';
import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';
import { SkillCardSkeletonGrid } from '@/components/Skeleton';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default function FreeHubPage() {
  return (
    <div className="space-y-10 pt-6 md:pt-10">
      <header className="surface-glow p-8 md:p-12">
        <div className="relative">
          <Eyebrow>Always free</Eyebrow>
          <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl">
            Try skills <span className="mute-weight">for free.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-fg-secondary md:text-lg">
            Hand-picked, free-to-run skills. No card needed. A great way to see what skills
            feel like before you upgrade.
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
        <div className="surface flex flex-col items-center p-12 text-center">
          <div className="font-display text-2xl font-semibold">No free skills yet.</div>
          <p className="mt-2 text-sm text-fg-secondary">Check back soon.</p>
          <Button href="/browse" className="mt-6" variant="secondary" trailingArrow>
            Explore all skills
          </Button>
        </div>
      );
    }
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s) => (
          <SkillCard key={s.id} skill={s} />
        ))}
      </div>
    );
  } catch {
    return (
      <div className="surface p-6 text-sm text-amber-300">
        Couldn't load free skills right now. Please try again in a moment.
      </div>
    );
  }
}
