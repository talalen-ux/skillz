import Link from 'next/link';
import { Button } from './ui/Button';
import { ChevronDown } from './ui/Icons';

const NAV: { href: string; label: string; dropdown?: boolean }[] = [
  { href: '/browse', label: 'Explore' },
  { href: '/browse', label: 'Categories' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/dashboard', label: 'For creators' },
  { href: '/free', label: 'Resources', dropdown: true },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/75 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-6 px-6 md:h-20 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark className="h-7 w-7" />
          <span className="font-display text-lg font-semibold tracking-tight">skillz</span>
        </Link>

        <ul className="hidden items-center gap-7 text-sm text-fg-secondary md:flex">
          {NAV.map((n) => (
            <li key={n.label}>
              <Link
                href={n.href}
                className="inline-flex items-center gap-1 transition hover:text-fg"
              >
                {n.label}
                {n.dropdown && <ChevronDown className="h-3.5 w-3.5" />}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden text-sm text-fg-secondary transition hover:text-fg md:block"
          >
            Sign in
          </Link>
          <Button href="/dashboard" size="sm" variant="primary">
            Create a skill
          </Button>
        </div>
      </nav>
    </header>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="hdrLogo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2C097" />
          <stop offset="60%" stopColor="#D4A373" />
          <stop offset="100%" stopColor="#8B5A3D" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="7"
        fill="#111113"
        stroke="#2A2A2E"
      />
      <path
        d="M22.5 11.5c-1.3-1.7-3.4-2.5-5.7-2.5-3.7 0-5.8 1.9-5.8 4.2 0 2.2 1.7 3.2 5 4l1.8.4c2.8.6 4.3 1.3 4.3 2.8 0 1.6-1.7 2.6-4.3 2.6-2.3 0-4.1-.8-5.4-2.3"
        stroke="url(#hdrLogo)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
