export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function SkillCardSkeleton() {
  return (
    <div className="surface flex flex-col p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-14 w-14 rounded-2xl" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <Skeleton className="mt-6 h-4 w-3/4" />
      <Skeleton className="mt-2 h-3 w-full" />
      <Skeleton className="mt-1.5 h-3 w-5/6" />
      <div className="mt-8 flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  );
}

export function SkillCardSkeletonGrid({ count = 4 }: { count?: number }) {
  const cols =
    count >= 6
      ? 'lg:grid-cols-3'
      : count === 4
      ? 'sm:grid-cols-2 lg:grid-cols-4'
      : 'sm:grid-cols-2 lg:grid-cols-3';
  return (
    <div className={`grid grid-cols-1 gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkillCardSkeleton key={i} />
      ))}
    </div>
  );
}
