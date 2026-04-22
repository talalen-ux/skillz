import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skillz — Plug AI skills into your workflow',
  description: 'Browse verified AI skills. Run them safely. Pay only for what works.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[60vh] bg-hero-grad" />
        <header className="sticky top-0 z-40 border-b border-line/60 bg-bg-base/70 backdrop-blur">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 text-base font-semibold tracking-tight">
              <span className="inline-block h-2 w-2 rounded-full bg-brand-500 shadow-[0_0_12px_#6366f1]" />
              skillz
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/browse" className="text-text-secondary transition hover:text-text-primary">
                Explore
              </Link>
              <Link href="/free" className="text-text-secondary transition hover:text-text-primary">
                Free
              </Link>
              <Link href="/dashboard" className="btn-secondary !px-4 !py-1.5 !text-xs">
                Create a skill
              </Link>
            </div>
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>

        <footer className="mx-auto max-w-6xl px-6 py-12 text-center text-xs text-text-muted">
          Skillz · Every skill is sandboxed and independently audited before it reaches you.
        </footer>
      </body>
    </html>
  );
}
