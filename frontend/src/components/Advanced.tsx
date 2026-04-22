'use client';

import { useState } from 'react';
import { ChevronDown } from './ui/Icons';

/** Disclosure block for power-user detail. Collapsed by default. */
export function Advanced({
  label = 'View advanced details',
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-xs text-fg-secondary transition hover:text-fg"
      >
        <ChevronDown
          className={`h-3.5 w-3.5 transition ${open ? 'rotate-180' : ''}`}
        />
        {open ? 'Hide advanced details' : label}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
