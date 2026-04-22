import type { FriendlyPermission } from '@/lib/trust';
import { describePermissions } from '@/lib/trust';

/**
 * Turns the raw permission manifest into a friendly checklist. Kept in the new
 * system's visual language but semantic colors (green / amber) preserved.
 */
export function PermissionsPreview({
  raw,
  heading = 'What this skill will do',
}: {
  raw: Record<string, any> | undefined | null;
  heading?: string;
}) {
  const items = describePermissions(raw);
  return (
    <div className="surface p-6">
      <h3 className="font-display text-sm font-semibold text-fg">{heading}</h3>
      <ul className="mt-4 space-y-2.5">
        {items.map((it) => (
          <PermissionRow key={it.key} item={it} />
        ))}
      </ul>
      <p className="mt-5 text-xs text-fg-muted">
        Skills run in a secure sandbox. Anything not listed here is blocked.
      </p>
    </div>
  );
}

function PermissionRow({ item }: { item: FriendlyPermission }) {
  const isGood = item.goodWhenAllowed ? item.allowed : !item.allowed;
  const icon = isGood ? '✓' : item.allowed ? '!' : '×';
  const tone = isGood ? 'text-emerald-400' : item.allowed ? 'text-amber-300' : 'text-fg-muted';
  const bg = isGood
    ? 'bg-emerald-500/10 border-emerald-500/20'
    : item.allowed
    ? 'bg-amber-500/10 border-amber-500/20'
    : 'bg-bg border-line';
  return (
    <li className="flex items-start gap-3 text-sm">
      <span
        className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold ${bg} ${tone}`}
      >
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-fg">{item.label}</div>
        {item.detail && <div className="mt-0.5 text-xs text-fg-muted">{item.detail}</div>}
      </div>
    </li>
  );
}
