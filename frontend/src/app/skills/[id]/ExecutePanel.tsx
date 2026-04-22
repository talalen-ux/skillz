'use client';

import { useState } from 'react';
import { api } from '@/lib/api';

export function ExecutePanel({ skillId }: { skillId: string }) {
  const [inputs, setInputs] = useState('{\n  "text": "hello"\n}');
  const [userId, setUserId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [pending, setPending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setPending(true);
    setErr(null);
    setResult(null);
    try {
      const parsed = JSON.parse(inputs);
      const r = await api.executeSkill(skillId, parsed, userId || undefined);
      setResult(r);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5">
      <h3 className="mb-3 font-semibold">Try this skill</h3>
      <label className="block text-xs text-zinc-600">x-user-id (any registered user)</label>
      <input
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        placeholder="paste a user id"
        className="mt-1 mb-3 w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-mono"
      />
      <label className="block text-xs text-zinc-600">inputs (JSON)</label>
      <textarea
        value={inputs}
        onChange={(e) => setInputs(e.target.value)}
        rows={6}
        className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 font-mono text-xs"
      />
      <button
        onClick={run}
        disabled={pending}
        className="mt-3 rounded-md bg-ink px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? 'Running…' : 'Execute'}
      </button>
      {err && <pre className="mt-3 rounded bg-red-50 p-3 text-xs text-red-700">{err}</pre>}
      {result && (
        <pre className="mt-3 max-h-80 overflow-auto rounded bg-zinc-50 p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
