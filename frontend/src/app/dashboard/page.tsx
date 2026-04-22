'use client';

import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Step = 'basics' | 'code' | 'permissions' | 'review' | 'done';

export default function DashboardPage() {
  const [userId, setUserId] = useState('');
  const [step, setStep] = useState<Step>('basics');
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: 'nlp',
    pricingModel: 'FREE',
    price: 0,
    code: 'def run(inputs, ctx):\n    return {"echo": inputs}\n',
    permissions: {
      allowedDomains: [] as string[],
      allowedActions: [] as string[],
      maxApiCalls: 0,
      timeoutSec: 5,
      memoryMb: 128,
      walletAccess: false,
      maxSpendUsd: 0,
    },
  });
  const [result, setResult] = useState<any>(null);
  const [auditing, setAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function publish() {
    setErr(null);
    try {
      const res = await fetch(`${API}/api/skills`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          category: form.category,
          pricingModel: form.pricingModel,
          price: Number(form.price),
          permissionsRequired: form.permissions,
          code: form.code,
          manifest: { entry: 'run' },
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(typeof data?.message === 'string' ? data.message : JSON.stringify(data));
        return;
      }
      setResult(data);
      setStep('done');
    } catch (e: any) {
      setErr(e.message);
    }
  }

  async function audit() {
    if (!result?.id) return;
    setAuditing(true);
    try {
      const res = await fetch(`${API}/api/skills/${result.id}/audit`, { method: 'POST' });
      setAuditResult(await res.json());
    } finally {
      setAuditing(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Create a skill</h1>
        <p className="mt-2 text-sm text-text-secondary">
          A skill is a small, focused capability. Think “summarise emails” or “track a wallet.”
        </p>
      </header>

      <Progress step={step} />

      <div className="glass p-6">
        <label className="text-xs text-text-secondary">Your user ID</label>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Use a seeded user id for now"
          className="mt-1 w-full rounded-lg border border-line bg-bg-sunken/60 px-3 py-2 text-sm outline-none focus:border-line-strong"
        />
        <p className="mt-1 text-[11px] text-text-muted">
          MVP shim — we'll swap in real sign-in later.
        </p>
      </div>

      {step === 'basics' && (
        <div className="glass space-y-5 p-6">
          <h2 className="text-base font-semibold">The basics</h2>
          <Field label="What's this skill called?">
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Email summariser"
              className="input"
            />
          </Field>
          <Field label="In one sentence, what does it do?">
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Turns a long email into 3 clear bullet points."
              className="input"
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="input"
              >
                <option value="nlp">Text & language</option>
                <option value="productivity">Productivity</option>
                <option value="trading">Trading</option>
                <option value="scraping">Web data</option>
              </select>
            </Field>
            <Field label="Pricing">
              <select
                value={form.pricingModel}
                onChange={(e) => setForm({ ...form, pricingModel: e.target.value })}
                className="input"
              >
                <option value="FREE">🆓 Free</option>
                <option value="PER_EXECUTION">💸 Pay per run</option>
                <option value="SUBSCRIPTION">📅 Monthly</option>
                <option value="PAID">💳 One-off</option>
              </select>
            </Field>
          </div>
          {form.pricingModel !== 'FREE' && (
            <Field label="Price (USD)">
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="input"
              />
            </Field>
          )}
          <div className="flex justify-end">
            <button
              onClick={() => setStep('code')}
              disabled={!form.name || !form.description || !userId}
              className="btn-primary disabled:opacity-50"
            >
              Next: Add code
            </button>
          </div>
        </div>
      )}

      {step === 'code' && (
        <div className="glass space-y-5 p-6">
          <h2 className="text-base font-semibold">Add the skill code</h2>
          <p className="text-sm text-text-secondary">
            Python. Define a <code className="rounded bg-white/5 px-1">run(inputs, ctx)</code> function
            that returns a dictionary. Runs in an isolated sandbox.
          </p>
          <textarea
            rows={12}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="input font-mono text-xs"
          />
          <div className="flex justify-between">
            <button onClick={() => setStep('basics')} className="btn-secondary">
              Back
            </button>
            <button onClick={() => setStep('permissions')} className="btn-primary">
              Next: Set permissions
            </button>
          </div>
        </div>
      )}

      {step === 'permissions' && (
        <div className="glass space-y-5 p-6">
          <h2 className="text-base font-semibold">What does it need access to?</h2>
          <p className="text-sm text-text-secondary">
            The less you ask for, the more users will trust it.
          </p>

          <Field label="Allowed websites (one per line)">
            <textarea
              rows={3}
              value={form.permissions.allowedDomains.join('\n')}
              onChange={(e) =>
                setForm({
                  ...form,
                  permissions: {
                    ...form.permissions,
                    allowedDomains: e.target.value
                      .split('\n')
                      .map((x) => x.trim())
                      .filter(Boolean),
                  },
                })
              }
              placeholder="e.g. en.wikipedia.org"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Max web requests per run">
              <input
                type="number"
                value={form.permissions.maxApiCalls}
                onChange={(e) =>
                  setForm({
                    ...form,
                    permissions: { ...form.permissions, maxApiCalls: Number(e.target.value) },
                  })
                }
                className="input"
              />
            </Field>
            <Field label="Timeout (seconds)">
              <input
                type="number"
                value={form.permissions.timeoutSec}
                onChange={(e) =>
                  setForm({
                    ...form,
                    permissions: { ...form.permissions, timeoutSec: Number(e.target.value) },
                  })
                }
                className="input"
              />
            </Field>
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-line bg-bg-sunken/60 p-3">
            <input
              type="checkbox"
              checked={form.permissions.walletAccess}
              onChange={(e) =>
                setForm({
                  ...form,
                  permissions: { ...form.permissions, walletAccess: e.target.checked },
                })
              }
            />
            <div>
              <div className="text-sm">This skill needs wallet access</div>
              <div className="text-xs text-text-muted">
                Rare. Only enable if your skill legitimately needs to read wallet data.
              </div>
            </div>
          </label>

          <div className="flex justify-between">
            <button onClick={() => setStep('code')} className="btn-secondary">
              Back
            </button>
            <button onClick={() => setStep('review')} className="btn-primary">
              Next: Review
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="glass space-y-4 p-6">
          <h2 className="text-base font-semibold">One last look</h2>
          <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <Row label="Name" value={form.name} />
            <Row label="Category" value={form.category} />
            <Row
              label="Pricing"
              value={`${form.pricingModel}${form.pricingModel !== 'FREE' ? ` · $${form.price}` : ''}`}
            />
            <Row label="Description" value={form.description} full />
          </dl>
          {err && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              {err}
            </div>
          )}
          <div className="flex justify-between">
            <button onClick={() => setStep('permissions')} className="btn-secondary">
              Back
            </button>
            <button onClick={publish} className="btn-primary">
              Publish skill
            </button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div className="glass space-y-4 p-6">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            🎉 Published! Now run a safety audit so users can trust it.
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={`/skills/${result.id}`} className="btn-secondary">
              View skill page
            </a>
            <button onClick={audit} disabled={auditing} className="btn-primary">
              {auditing ? 'Running audit…' : 'Run safety audit'}
            </button>
          </div>
          {auditResult && (
            <div className="rounded-xl border border-line bg-bg-sunken/60 p-4 text-sm">
              <div className="font-medium">
                Certification: <span className="text-emerald-300">{auditResult.certification}</span>
              </div>
              <details className="mt-2 text-xs text-text-muted">
                <summary className="cursor-pointer hover:text-text-secondary">
                  View detailed audit report
                </summary>
                <pre className="mt-2 max-h-72 overflow-auto rounded bg-bg-sunken p-2 text-[11px]">
                  {JSON.stringify(auditResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(7, 7, 11, 0.6);
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #f5f5f7;
          outline: none;
        }
        .input:focus {
          border-color: rgba(255, 255, 255, 0.18);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-text-secondary">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function Row({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? 'md:col-span-2' : ''}>
      <dt className="text-[11px] uppercase tracking-wider text-text-muted">{label}</dt>
      <dd className="mt-0.5 text-text-primary">{value || <span className="text-text-muted">—</span>}</dd>
    </div>
  );
}

function Progress({ step }: { step: Step }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'basics', label: 'Basics' },
    { key: 'code', label: 'Code' },
    { key: 'permissions', label: 'Permissions' },
    { key: 'review', label: 'Review' },
    { key: 'done', label: 'Published' },
  ];
  const idx = steps.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2 text-xs">
      {steps.map((s, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                done
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : active
                  ? 'border-white bg-white text-bg-base'
                  : 'border-line text-text-muted'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <span className={active ? 'text-text-primary' : 'text-text-muted'}>{s.label}</span>
            {i < steps.length - 1 && <span className="text-text-muted">—</span>}
          </li>
        );
      })}
    </ol>
  );
}
