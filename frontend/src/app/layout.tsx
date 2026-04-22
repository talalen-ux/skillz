import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Skillz — AI Agent Skills Marketplace',
  description: 'Discover, audit, and execute AI agent skills.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b border-zinc-200 bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="text-lg font-bold tracking-tight">
              skillz<span className="text-accent">.</span>
            </Link>
            <div className="flex gap-6 text-sm font-medium">
              <Link href="/browse" className="hover:text-accent">Browse</Link>
              <Link href="/free" className="hover:text-accent">Free Hub</Link>
              <Link href="/dashboard" className="hover:text-accent">Dashboard</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
        <footer className="mx-auto max-w-6xl px-6 py-12 text-xs text-zinc-500">
          Skillz MVP · Skills are sandboxed and audited. Trade carefully.
        </footer>
      </body>
    </html>
  );
}
