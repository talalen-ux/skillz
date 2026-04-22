import * as React from 'react';

type Tone = 'neutral' | 'accent' | 'safe' | 'caution' | 'risk';

const tones: Record<Tone, string> = {
  neutral: 'border-line bg-bg-elevated text-fg-secondary',
  accent:
    'border-accent-deep/60 bg-accent/10 text-accent-glow',
  safe: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  caution: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  risk: 'border-red-500/30 bg-red-500/10 text-red-300',
};

export function Chip({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.18em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
