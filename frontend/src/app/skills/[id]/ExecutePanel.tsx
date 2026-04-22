'use client';

import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { describePermissions } from '@/lib/trust';
import { PermissionsPreview } from '@/components/PermissionsPreview';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';

type Phase = 'edit' | 'confirm' | 'running' | 'done';

export function ExecutePanel({
  skillId,
  skillName,
  permissions,
  isFree,
}: {
  skillId: string;
  skillName: string;
  permissions: Record<string, any>;
  isFree: boolean;
}) {
  const [phase, setPhase] = useState<Phase>('edit');
  const [inputs, setInputs] = useState('{\n  "text": "hello"\n}');
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  const perms = useMemo(() => describePermissions(permissions), [permissions]);
  const walletRisk = perms.find((p) => p.key === 'wallet')?.allowed;
  const spendRisk = perms.find((p) => p.key === 'send')?.allowed;

  async function reallyRun() {
    setPhase('running');
    setErr(null);
    setResult(null);
    try {
      const parsed = JSON.parse(inputs);
      const r = await api.executeSkill(skillId, parsed, userId || undefined);
      setResult(r);
      setPhase('done');
    } catch (e: any) {
      setErr(e.message);
      setPhase('confirm');
    }
  }

  return (
    <div className="surface sticky top-24 p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold text-fg">Run this skill</h3>
        {isFree && <Chip tone="accent">Free to run</Chip>}
      </div>

      {phase === 'edit' && (
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className="text-xs text-fg-secondary">Your user ID</span>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Any existing user ID"
              className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none transition focus:border-line-strong"
            />
            <p className="mt-1 text-[11px] text-fg-muted">
              MVP shim — reviews require this to prove you ran the skill.
            </p>
          </label>
          <label className="block">
            <span className="text-xs text-fg-secondary">What should it work on?</span>
            <textarea
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 font-mono text-xs outline-none transition focus:border-line-strong"
            />
            <p className="mt-1 text-[11px] text-fg-muted">
              JSON. Example:{' '}
              <code className="rounded bg-white/5 px-1">{'{ "text": "..." }'}</code>
            </p>
          </label>
          <Button onClick={() => setPhase('confirm')} className="w-full" trailingArrow>
            Continue
          </Button>

          <div className="pt-2">
            <PermissionsPreview raw={permissions} heading="Permissions preview" />
          </div>
        </div>
      )}

      {phase === 'confirm' && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-line bg-bg p-4">
            <div className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">
              Before you run
            </div>
            <p className="mt-1.5 text-sm text-fg">
              <span className="font-medium">{skillName}</span> will:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {perms.map((it) => {
                const good = it.goodWhenAllowed ? it.allowed : !it.allowed;
                const glyph = good ? '✓' : it.allowed ? '!' : '×';
                const color = good
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : it.allowed
                  ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
                  : 'text-fg-muted bg-bg border-line';
                return (
                  <li key={it.key} className="flex items-start gap-2.5">
                    <span
                      className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[11px] font-bold ${color}`}
                    >
                      {glyph}
                    </span>
                    <span className="text-fg">{it.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            className={`rounded-xl border p-4 text-sm ${
              walletRisk || spendRisk
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
            }`}
          >
            {walletRisk || spendRisk
              ? 'This skill requests wallet-related access. Review carefully.'
              : 'Your funds are safe. This skill cannot move assets.'}
          </div>

          {err && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => setPhase('edit')}
              variant="secondary"
              className="flex-1"
            >
              Back
            </Button>
            <Button onClick={reallyRun} className="flex-1" trailingArrow>
              Confirm & run
            </Button>
          </div>
        </div>
      )}

      {phase === 'running' && (
        <div className="mt-6 space-y-3">
          <div className="skeleton h-3 w-2/3" />
          <div className="skeleton h-3 w-4/5" />
          <div className="skeleton h-3 w-1/2" />
          <p className="mt-3 text-sm text-fg-secondary">Running in a secure sandbox…</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="mt-5 space-y-3">
          <div
            className={`rounded-xl border p-4 text-sm ${
              result?.status === 'SUCCEEDED'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                : result?.status === 'BLOCKED'
                ? 'border-amber-500/40 bg-amber-500/10 text-amber-200'
                : 'border-red-500/40 bg-red-500/10 text-red-200'
            }`}
          >
            {result?.status === 'SUCCEEDED'
              ? "Done. Here's the result."
              : result?.status === 'BLOCKED'
              ? "The sandbox blocked a disallowed action. You're safe."
              : 'Something went wrong.'}
          </div>
          <pre className="max-h-64 overflow-auto rounded-xl border border-line bg-bg p-3 text-xs text-fg-secondary">
            {JSON.stringify(result?.output ?? result?.error ?? result, null, 2)}
          </pre>
          <Button
            onClick={() => setPhase('edit')}
            variant="secondary"
            className="w-full"
          >
            Run again
          </Button>
          <details className="text-xs text-fg-muted">
            <summary className="cursor-pointer hover:text-fg-secondary">
              View technical details
            </summary>
            <pre className="mt-2 max-h-72 overflow-auto rounded-xl border border-line bg-bg p-3 text-[11px] text-fg-secondary">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
