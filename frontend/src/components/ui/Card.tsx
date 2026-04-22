import Link from 'next/link';
import * as React from 'react';

type CardProps = {
  as?: 'div' | 'section' | 'article';
  href?: string;
  className?: string;
  children: React.ReactNode;
  hover?: boolean;
};

export function Card({
  as: Tag = 'div',
  href,
  className = '',
  hover,
  children,
}: CardProps) {
  const base =
    'rounded-2xl border border-line bg-bg-raised ' +
    (hover
      ? 'transition hover:border-line-strong hover:bg-bg-elevated'
      : '');
  const cls = `${base} ${className}`;
  if (href) {
    return (
      <Link href={href} className={`block ${cls}`}>
        {children}
      </Link>
    );
  }
  return <Tag className={cls}>{children}</Tag>;
}
