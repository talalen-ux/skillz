/**
 * Small-caps section label with a bronze dot marker — the reference's
 * "• FEATURED SKILLS", "• VERIFIED. SAFE. POWERFUL." pattern.
 */
export function Eyebrow({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span className="h-1 w-1 rounded-full bg-accent-glow" aria-hidden />
      <span className="eyebrow">{children}</span>
    </div>
  );
}
