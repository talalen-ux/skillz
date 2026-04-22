'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function DashboardPage() {
  const [userId, setUserId] = useState('');
  const [form, setForm] = useState({
    name: 'My Skill',
    description: 'A short description of what this skill does.',
    category: 'nlp',
    pricingModel: 'FREE',
    price: 0,
    code: 'def run(inputs, ctx):\n    return {"echo": inputs}\n',
    permissions: JSON.stringify(
      {
        allowedDomains: [],
        allowedActions: [],
        maxApiCalls: 0,
        timeoutSec: 5,
        memoryMb: 128,
        walletAccess: false,
      },
      null,
      2,
    ),
  });
  const [result, setResult] = useState<any>(null);
  const [auditing, setAuditing] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<any>(null);

  async function publish() {
    setResult(null);
    const res = await fetch(`${API}/api/skills`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-user-id': userId },
      body: JSON.stringify({
        name: form.name,
        description: form.description,
        category: form.category,
        pricingModel: form.pricingModel,
        price: Number(form.price),
        permissionsRequired: JSON.parse(form.permissions),
        code: form.code,
        manifest: { entry: 'run' },
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setResult({ error: data });
      return;
    }
    setResult(data);
  }

  async function audit(id: string) {
    setAuditing(id);
    setAuditResult(null);
    const res = await fetch(`${API}/api/skills/${id}/audit`, { method: 'POST' });
    const data = await res.json();
    setAuditResult(data);
    setAuditing(null);
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Creator Dashboard</h1>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <label className="text-xs text-zinc-600">x-user-id (your user id)</label>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-mono"
        />
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white p-5">
        <h2 className="mb-3 text-lg font-semibold">Publish a new skill</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Field label="Name">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            >
              <option value="trading">trading</option>
              <option value="scraping">scraping</option>
              <option value="nlp">nlp</option>
              <option value="productivity">productivity</option>
            </select>
          </Field>
          <Field label="Pricing">
            <select
              value={form.pricingModel}
              onChange={(e) => setForm({ ...form, pricingModel: e.target.value })}
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            >
              <option>FREE</option>
              <option>PAID</option>
              <option>SUBSCRIPTION</option>
              <option>PER_EXECUTION</option>
            </select>
          </Field>
          <Field label="Price (USD)">
            <input
              type="number"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
            />
          </Field>
        </div>
        <Field label="Description" className="mt-3">
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded border border-zinc-300 px-2 py-1 text-sm"
          />
        </Field>
        <Field label="Skill code (Python — must define run(inputs, ctx))" className="mt-3">
          <textarea
            rows={8}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full rounded border border-zinc-300 px-2 py-1 font-mono text-xs"
          />
        </Field>
        <Field label="Permissions (JSON)" className="mt-3">
          <textarea
            rows={6}
            value={form.permissions}
            onChange={(e) => setForm({ ...form, permissions: e.target.value })}
            className="w-full rounded border border-zinc-300 px-2 py-1 font-mono text-xs"
          />
        </Field>
        <button
          disabled={!userId}
          onClick={publish}
          className="mt-4 rounded-md bg-ink px-4 py-1.5 text-sm font-medium text-white disabled:opacity-50"
        >
          Publish skill
        </button>
        {result && (
          <pre className="mt-3 max-h-64 overflow-auto rounded bg-zinc-50 p-3 text-xs">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
        {result?.id && (
          <button
            onClick={() => audit(result.id)}
            disabled={auditing !== null}
            className="mt-2 rounded-md border border-zinc-300 px-3 py-1 text-xs"
          >
            {auditing ? 'Auditing…' : 'Run full audit pipeline'}
          </button>
        )}
        {auditResult && (
          <pre className="mt-2 max-h-80 overflow-auto rounded bg-zinc-50 p-3 text-xs">
            {JSON.stringify(auditResult, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <div className="mb-1 text-xs text-zinc-600">{label}</div>
      {children}
    </div>
  );
}
