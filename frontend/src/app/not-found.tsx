import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <div className="text-5xl">🛰</div>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight">We couldn't find that.</h1>
      <p className="mt-2 text-sm text-text-secondary">
        The skill or creator may have been removed, or you may have followed a stale link.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/browse" className="btn-primary">
          Explore skills
        </Link>
        <Link href="/" className="btn-secondary">
          Back home
        </Link>
      </div>
    </div>
  );
}
