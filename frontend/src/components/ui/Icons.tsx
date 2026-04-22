/**
 * Minimal outline icon set. Stroke currentColor so colors are driven by parent.
 * Keeps bundle tiny — we only include what we actually use.
 */
import * as React from 'react';

type Props = { className?: string };

const Icon = ({
  children,
  className = 'h-5 w-5',
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);

export const Shield = (p: Props) => (
  <Icon className={p.className}>
    <path d="M12 3l8 3v6c0 4.5-3.4 8.5-8 9-4.6-.5-8-4.5-8-9V6l8-3z" />
    <path d="M9 12l2 2 4-4" />
  </Icon>
);

export const Check = (p: Props) => (
  <Icon className={p.className}>
    <path d="M4 12l5 5L20 6" />
  </Icon>
);

export const CheckCircle = (p: Props) => (
  <Icon className={p.className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12l3 3 5-6" />
  </Icon>
);

export const Card = (p: Props) => (
  <Icon className={p.className}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </Icon>
);

export const Box = (p: Props) => (
  <Icon className={p.className}>
    <path d="M3 7l9-4 9 4-9 4-9-4z" />
    <path d="M3 7v10l9 4 9-4V7M12 11v10" />
  </Icon>
);

export const Users = (p: Props) => (
  <Icon className={p.className}>
    <circle cx="9" cy="9" r="3.2" />
    <path d="M2.5 19c.8-3 3.5-4.6 6.5-4.6s5.7 1.6 6.5 4.6" />
    <circle cx="17" cy="8" r="2.6" />
    <path d="M15 14c2.6 0 4.6 1.3 5.5 3.2" />
  </Icon>
);

export const Bolt = (p: Props) => (
  <Icon className={p.className}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </Icon>
);

export const Star = (p: Props) => (
  <Icon className={p.className}>
    <path d="M12 3l2.6 6 6.4.5-4.9 4.2 1.5 6.3L12 17l-5.6 3 1.5-6.3L3 9.5 9.4 9 12 3z" />
  </Icon>
);

export const Chart = (p: Props) => (
  <Icon className={p.className}>
    <path d="M4 19V5M9 19v-7M14 19V8M19 19v-4" />
  </Icon>
);

export const Spark = (p: Props) => (
  <Icon className={p.className}>
    <path d="M12 2v5M12 17v5M2 12h5M17 12h5M5 5l3.5 3.5M15.5 15.5L19 19M5 19l3.5-3.5M15.5 8.5L19 5" />
  </Icon>
);

export const Bookmark = (p: Props) => (
  <Icon className={p.className}>
    <path d="M7 4h10v16l-5-3.5L7 20z" />
  </Icon>
);

export const Search = (p: Props) => (
  <Icon className={p.className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M20 20l-4-4" />
  </Icon>
);

export const ChevronDown = (p: Props) => (
  <Icon className={p.className}>
    <path d="M5 9l7 7 7-7" />
  </Icon>
);

export const Globe = (p: Props) => (
  <Icon className={p.className}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" />
  </Icon>
);

export const Lock = (p: Props) => (
  <Icon className={p.className}>
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 018 0v4" />
  </Icon>
);

export const Warning = (p: Props) => (
  <Icon className={p.className}>
    <path d="M12 3l10 18H2L12 3z" />
    <path d="M12 10v5M12 18.5v.1" />
  </Icon>
);

export const Chat = (p: Props) => (
  <Icon className={p.className}>
    <path d="M5 4h14a2 2 0 012 2v9a2 2 0 01-2 2H9l-5 4V6a2 2 0 012-2z" />
  </Icon>
);

export const Image = (p: Props) => (
  <Icon className={p.className}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="M3 16l5-5 6 6M14 13l3-3 4 4" />
  </Icon>
);
