'use client';

import { useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { describePermissions } from '@/lib/trust';
import { PermissionsPreview } from '@/components/PermissionsPreview';

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
    <div className="glass p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold">Run this skill</h3>
        {isFree && (
          <span className="chip border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
            Free to run
          </span>
        )}
      </div>

      {phase === 'edit' && (
        <div className="mt-4 space-y-4">
          <div>
            <label className="text-xs text-text-secondary">Your user ID</label>
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Any existing user ID"
              className="mt-1 w-full rounded-lg border border-line bg-bg-sunken/60 px-3 py-2 text-sm outline-none focus:border-line-strong"
            />
            <p className="mt-1 text-[11px] text-text-muted">
              MVP shim — reviews require this to prove you ran the skill.
            </p>
          </div>
          <div>
            <label className="text-xs text-text-secondary">What should it work on?</label>
            <textarea
              value={inputs}
              onChange={(e) => setInputs(e.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-line bg-bg-sunken/60 px-3 py-2 font-mono text-xs outline-none focus:border-line-strong"
            />
            <p className="mt-1 text-[11px] text-text-muted">
              JSON. Example: <code className="rounded bg-white/5 px-1">{'{ "text": "..." }'}</code>
            </p>
          </div>
          <button onClick={() => setPhase('confirm')} className="btn-primary w-full">
            Continue
          </button>
        </div>
      )}

      {phase === 'confirm' && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-line bg-bg-sunken/40 p-4">
            <div className="text-xs uppercase tracking-wider text-text-muted">Before you run</div>
            <p className="mt-1 text-sm text-text-primary">
              <span className="font-medium">{skillName}</span> will:
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {perms.map((it) => {
                const good = it.goodWhenAllowed ? it.allowed : !it.allowed;
                const icon = good ? '✅' : it.allowed ? '⚠️' : '❌';
                const color = good
                  ? 'text-emerald-400'
                  : it.allowed
                  ? 'text-amber-300'
                  : 'text-text-muted';
                return (
                  <li key={it.key} className="flex items-start gap-2.5">
                    <span className={color}>{icon}</span>
                    <span className="text-text-primary">{it.label}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div
            className={`rounded-xl border p-4 text-sm ${
              walletRisk || spendRisk
                ? 'border-amber-500/40 bg-amber-500/5 text-amber-200'
                : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-200'
            }`}
          >
            {walletRisk || spendRisk ? (
              <>⚠️ This skill requests wallet-related access. Review carefully.</>
            ) : (
              <>🔒 Your funds are safe. This skill cannot move assets.</>
            )}
          </div>

          {err && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={() => setPhase('edit')} className="btn-secondary flex-1">
              Back
            </button>
            <button onClick={reallyRun} className="btn-primary flex-1">
              Confirm & run
            </button>
          </div>
        </div>
      )}

      {phase === 'running' && (
        <div className="mt-6 space-y-3">
          <div className="skeleton h-3 w-2/3" />
          <div className="skeleton h-3 w-4/5" />
          <div className="skeleton h-3 w-1/2" />
          <p className="mt-3 text-sm text-text-secondary">Running in a secure sandbox…</p>
        </div>
      )}

      {phase === 'done' && (
        <div className="mt-4 space-y-3">
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
              ? "✅ Done! Here's the result."
              : result?.status === 'BLOCKED'
              ? "⛔ The sandbox blocked a disallowed action. You're safe."
              : '⚠️ Something went wrong.'}
          </div>
          <pre className="max-h-64 overflow-auto rounded-xl border border-line bg-bg-sunken/60 p-3 text-xs">
            {JSON.stringify(result?.output ?? result?.error ?? result, null, 2)}
          </pre>
          <div className="flex gap-2">
            <button onClick={() => setPhase('edit')} className="btn-secondary flex-1">
              Run again
            </button>
          </div>
          <details className="text-xs text-text-muted">
            <summary className="cursor-pointer hover:text-text-secondary">
              View technical details
            </summary>
            <pre className="mt-2 max-h-72 overflow-auto rounded border border-line bg-bg-sunken/60 p-3 text-[11px]">
              {JSON.stringify(result, null, 2)}
            </pre>
          </details>
        </div>
      )}

      {phase === 'edit' && (
        <div className="mt-6">
          <PermissionsPreview raw={permissions} heading="Permissions preview" />
        </div>
      )}
    </div>
  );
}
