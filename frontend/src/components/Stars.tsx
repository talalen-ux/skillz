export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const arr = Array.from({ length: 5 }, (_, i) => {
    if (i < full) return 'full';
    if (i === full && half) return 'half';
    return 'empty';
  });
  return (
    <span className="inline-flex items-center" aria-label={`${value.toFixed(1)} out of 5`}>
      {arr.map((s, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          className="mr-0.5"
          aria-hidden
        >
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="#F5B848" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.10)" />
            </linearGradient>
          </defs>
          <path
            d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z"
            fill={s === 'full' ? '#F5B848' : s === 'half' ? `url(#half-${i})` : 'rgba(255,255,255,0.10)'}
          />
        </svg>
      ))}
    </span>
  );
}
