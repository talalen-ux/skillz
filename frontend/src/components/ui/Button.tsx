import Link from 'next/link';
import * as React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'accent';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition active:scale-[0.98] ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 ' +
  'focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap';

const variantStyles: Record<Variant, string> = {
  primary: 'bg-fg text-bg hover:bg-white',
  secondary: 'border border-line-strong text-fg hover:bg-white/5',
  ghost: 'text-fg-secondary hover:text-fg',
  accent: 'bg-accent text-accent-foreground hover:bg-accent-glow',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-sm md:h-[52px] md:px-7',
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  trailingArrow?: boolean;
  leading?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

type AsButton = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { href: string };

type Props = AsButton | AsLink;

export function Button(props: Props) {
  const {
    variant = 'primary',
    size = 'md',
    trailingArrow,
    leading,
    className = '',
    children,
    ...rest
  } = props;
  const cls = `${base} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  const content = (
    <>
      {leading}
      <span>{children}</span>
      {trailingArrow && <ArrowRight className="h-4 w-4" />}
    </>
  );
  if ('href' in rest && typeof rest.href === 'string') {
    return (
      <Link {...(rest as AsLink)} className={cls}>
        {content}
      </Link>
    );
  }
  return (
    <button {...(rest as AsButton)} className={cls}>
      {content}
    </button>
  );
}

export function ArrowRight({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden>
      <path
        d="M3 8h10m0 0L8.5 3.5M13 8l-4.5 4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
