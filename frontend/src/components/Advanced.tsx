'use client';

import { useState } from 'react';

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
        className="text-xs font-medium text-text-secondary hover:text-text-primary"
      >
        {open ? '− Hide advanced details' : `+ ${label}`}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}
