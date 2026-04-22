import { Suspense } from 'react';
import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';
import { SkillCardSkeletonGrid } from '@/components/Skeleton';
import { HeroIllustration } from '@/components/HeroIllustration';
import { Button, ArrowRight } from '@/components/ui/Button';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { StatsBar, type Stat } from '@/components/ui/StatsBar';
import { TrustBullet } from '@/components/ui/TrustBullet';
import { Box, Users, Bolt, Star, Shield, CheckCircle, Card as CardIcon } from '@/components/ui/Icons';

export const dynamic = 'force-dynamic';

const STATS: Stat[] = [
  { value: '12,847', label: 'Verified skills', icon: <Box className="h-5 w-5" /> },
  { value: '284K+', label: 'Active users', icon: <Users className="h-5 w-5" /> },
  { value: '3.2M+', label: 'Skills executed', icon: <Bolt className="h-5 w-5" /> },
  { value: '4.9/5', label: 'Average rating', icon: <Star className="h-5 w-5" /> },
  { value: '100%', label: 'Funds & data safe', icon: <Shield className="h-5 w-5" /> },
];

export default function HomePage() {
  return (
    <div className="space-y-24 pt-6 md:space-y-32 md:pt-12">
      <Hero />
      <StatsBar stats={STATS} />

      <section className="space-y-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <Eyebrow>Featured skills</Eyebrow>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-5xl">
              Hand-picked for results.
            </h2>
            <p className="mt-3 max-w-xl text-sm text-fg-secondary md:text-base">
              Top performing skills trusted by thousands
              <br className="hidden md:block" />
              of professionals and builders.
            </p>
          </div>
          <Button href="/browse" variant="ghost" trailingArrow size="sm">
            View all skills
          </Button>
        </div>

        <Suspense fallback={<SkillCardSkeletonGrid count={4} />}>
          <Featured />
        </Suspense>
      </section>

      <HowItWorks />
    </div>
  );
}

function Hero() {
  return (
    <section className="grid grid-cols-1 items-center gap-10 md:grid-cols-12 md:gap-12">
      <div className="md:col-span-7">
        <Eyebrow>Verified. Safe. Powerful.</Eyebrow>

        <h1 className="mt-6 font-display text-[clamp(2.5rem,6.5vw,5.5rem)] font-semibold leading-[1.02] tracking-tight">
          AI skills <span className="mute-weight">that</span>
          <br />
          get real work done.
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-fg-secondary md:text-lg">
          Discover, run, and automate with verified AI skills built by experts.
          <br className="hidden md:block" />
          Secure sandbox. Transparent results. Total peace of mind.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Button href="/browse" variant="primary" size="lg" trailingArrow>
            Explore skills
          </Button>
          <Button href="/dashboard" variant="secondary" size="lg" trailingArrow>
            Create a skill
          </Button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
          <TrustBullet icon={<Shield className="h-4 w-4" />}>
            Every skill is audited
          </TrustBullet>
          <TrustBullet icon={<CheckCircle className="h-4 w-4" />}>
            Independently verified
          </TrustBullet>
          <TrustBullet icon={<CardIcon className="h-4 w-4" />}>
            Pay only for results
          </TrustBullet>
        </div>
      </div>

      <div className="md:col-span-5">
        <HeroIllustration className="mx-auto max-w-md md:max-w-none" />
      </div>
    </section>
  );
}

async function Featured() {
  try {
    const { items } = await api.listSkills({ sort: 'rating', limit: '4' });
    if (items.length === 0) return <EmptyFeatured />;
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((s) => (
          <SkillCard key={s.id} skill={s} />
        ))}
      </div>
    );
  } catch {
    return <EmptyFeatured />;
  }
}

function EmptyFeatured() {
  return (
    <div className="surface flex flex-col items-center px-8 py-14 text-center">
      <div className="font-display text-3xl font-semibold tracking-tight">
        No featured skills yet.
      </div>
      <p className="mt-2 max-w-sm text-sm text-fg-secondary">
        Explore the full catalogue while we curate the top performers.
      </p>
      <Button href="/browse" className="mt-6" size="md" trailingArrow>
        Explore all skills
      </Button>
    </div>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: 'Pick a skill',
      desc: 'Browse verified skills by what they do — no technical terms.',
    },
    {
      title: 'See what it will do',
      desc: 'Plain-English preview of every permission before a single line runs.',
    },
    {
      title: 'Run it, safely',
      desc: 'Each run happens in an isolated sandbox. Your data stays yours.',
    },
  ];
  return (
    <section id="how-it-works" className="space-y-8">
      <div>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight md:text-5xl">
          Three steps. Zero surprises.
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <article
            key={s.title}
            className="surface flex flex-col justify-between p-7 md:p-8"
          >
            <div className="font-display text-5xl font-semibold leading-none text-fg-dim">
              0{i + 1}
            </div>
            <div className="mt-10">
              <h3 className="font-display text-xl font-semibold text-fg md:text-2xl">
                {s.title}
              </h3>
              <p className="mt-2 text-sm text-fg-secondary md:text-base">{s.desc}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
