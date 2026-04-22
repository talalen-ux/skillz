import * as React from 'react';

type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, string> = {
  sm: 'h-9 w-9 rounded-lg',
  md: 'h-11 w-11 rounded-xl',
  lg: 'h-14 w-14 rounded-2xl',
};

/**
 * Small glassy tile that holds an icon. Mimics the reference's little
 * 3D-rendered object blocks — subtle inner gradient, hairline border.
 */
export function IconTile({
  size = 'md',
  children,
  className = '',
}: {
  size?: Size;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`inline-flex shrink-0 items-center justify-center border border-line bg-icon-tile text-accent-glow ${sizes[size]} ${className}`}
    >
      {children}
    </div>
  );
}
