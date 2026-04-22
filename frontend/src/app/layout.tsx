import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/components/SiteHeader';

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const display = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'Skillz — AI skills that get real work done',
  description:
    'Discover, run, and automate with verified AI skills built by experts. Secure sandbox. Transparent results.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} dark`}>
      <body>
        <SiteHeader />
        <main className="mx-auto max-w-[1200px] px-6 pb-24 pt-10 md:px-10">{children}</main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-6 py-10 text-xs text-fg-muted md:flex-row md:items-center md:justify-between md:px-10">
            <div className="flex items-center gap-3">
              <LogoMark className="h-5 w-5" />
              <span>skillz</span>
              <span className="text-fg-dim">· Verified AI skills marketplace</span>
            </div>
            <div className="text-fg-dim">
              Every skill runs in a secure sandbox and passes an independent audit.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <linearGradient id="lm" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D4A373" />
          <stop offset="100%" stopColor="#8B5A3D" />
        </linearGradient>
      </defs>
      <path
        d="M23 10c-1.6-2-4.2-3-7-3-4.4 0-7 2.3-7 5.2 0 2.7 2 3.9 6 4.8l2.2.5c3.4.8 5.2 1.6 5.2 3.4 0 1.9-2 3.1-5.2 3.1-2.8 0-5-1-6.6-2.8"
        stroke="url(#lm)"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
