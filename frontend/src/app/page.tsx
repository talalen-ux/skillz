import Link from 'next/link';
import { Suspense } from 'react';
import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';
import { SkillCardSkeletonGrid } from '@/components/Skeleton';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <div className="space-y-20">
      <Hero />
      <section>
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Popular skills this week</h2>
            <p className="mt-1 text-sm text-text-secondary">
              Hand-picked, verified, and safe to try.
            </p>
          </div>
          <Link
            href="/browse"
            className="text-sm text-text-secondary transition hover:text-text-primary"
          >
            See all →
          </Link>
        </div>
        <Suspense fallback={<SkillCardSkeletonGrid count={6} />}>
          <Featured />
        </Suspense>
      </section>

      <HowItWorks />
    </div>
  );
}

async function Featured() {
  try {
    const { items } = await api.listSkills({ sort: 'rating', limit: '6' });
    if (items.length === 0) return <EmptyFeatured />;
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
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
    <div className="glass flex flex-col items-center p-10 text-center">
      <div className="text-3xl">✨</div>
      <h3 className="mt-3 text-base font-semibold">No skills to feature yet</h3>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        Check back in a moment, or explore the full catalogue.
      </p>
      <Link href="/browse" className="btn-primary mt-5">
        Explore skills
      </Link>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 md:pt-12">
      <div className="mx-auto max-w-3xl text-center">
        <span className="chip mx-auto mb-5 border-line-strong bg-white/5 text-text-secondary">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Every skill audited before you run it
        </span>
        <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
          Plug powerful AI skills
          <br />
          into your workflow in seconds.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base text-text-secondary md:text-lg">
          Browse verified AI skills. Run them safely. Pay only for what works.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/browse" className="btn-primary">
            Explore skills
          </Link>
          <Link href="/dashboard" className="btn-secondary">
            Create a skill
          </Link>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-text-muted">
          <span>🔒 Sandboxed by default</span>
          <span>✅ Independently verified</span>
          <span>💸 Only pay for runs that work</span>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      title: 'Pick a skill',
      copy: 'Browse verified skills by what they do — no technical terms.',
      icon: '🔎',
    },
    {
      title: 'See what it will do',
      copy: 'We show a plain-English preview of every permission it needs.',
      icon: '🛡',
    },
    {
      title: 'Run it safely',
      copy: 'Every skill runs in an isolated sandbox. Your data stays yours.',
      icon: '▶️',
    },
  ];
  return (
    <section>
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight">How it works</h2>
        <p className="mt-1 text-sm text-text-secondary">Three steps. Zero surprises.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="glass p-6">
            <div className="text-2xl">{s.icon}</div>
            <div className="mt-3 text-xs font-medium uppercase tracking-wider text-text-muted">
              Step {i + 1}
            </div>
            <h3 className="mt-1 text-base font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{s.copy}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
