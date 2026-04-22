import type { FriendlyPermission } from '@/lib/trust';
import { describePermissions } from '@/lib/trust';

/**
 * Converts the raw permission manifest into a friendly checklist:
 * green ticks for reassuring statements, red crosses for risky ones.
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
    <div className="glass p-5">
      <h3 className="text-sm font-semibold text-text-primary">{heading}</h3>
      <ul className="mt-3 space-y-2.5">
        {items.map((it) => (
          <PermissionRow key={it.key} item={it} />
        ))}
      </ul>
      <p className="mt-4 text-xs text-text-muted">
        Skills run in a secure sandbox. Anything not listed here is blocked.
      </p>
    </div>
  );
}

function PermissionRow({ item }: { item: FriendlyPermission }) {
  // "good" when reassuring: either an allowed reassuring capability, or a denied risky one.
  const isGood = item.goodWhenAllowed ? item.allowed : !item.allowed;
  const icon = isGood ? '✅' : item.allowed ? '⚠️' : '❌';
  const color = isGood ? 'text-emerald-400' : item.allowed ? 'text-amber-300' : 'text-text-muted';
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className={`mt-0.5 ${color}`} aria-hidden>
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-text-primary">{item.label}</div>
        {item.detail && <div className="text-xs text-text-muted">{item.detail}</div>}
      </div>
    </li>
  );
}
