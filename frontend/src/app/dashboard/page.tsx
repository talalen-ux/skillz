'use client';

import { useState } from 'react';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { Button } from '@/components/ui/Button';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Step = 'basics' | 'code' | 'permissions' | 'review' | 'done';

const STEPS: { key: Step; label: string }[] = [
  { key: 'basics', label: 'Basics' },
  { key: 'code', label: 'Code' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'review', label: 'Review' },
  { key: 'done', label: 'Published' },
];

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
    <div className="mx-auto max-w-3xl space-y-10 pt-6 md:pt-10">
      <header>
        <Eyebrow>For creators</Eyebrow>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-tight md:text-6xl">
          Create a skill.
        </h1>
        <p className="mt-4 max-w-xl text-base text-fg-secondary md:text-lg">
          A skill is a small, focused capability. Think "summarise emails" or "track a wallet."
        </p>
      </header>

      <Progress step={step} />

      <div className="surface p-6">
        <label className="block text-xs text-fg-secondary">Your user ID</label>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Use a seeded user id for now"
          className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm outline-none transition focus:border-line-strong"
        />
        <p className="mt-1 text-[11px] text-fg-muted">MVP shim — we'll swap in real sign-in later.</p>
      </div>

      {step === 'basics' && (
        <div className="surface space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold">The basics</h2>
          <Field label="What's this skill called?">
            <Input
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="e.g. Email summariser"
            />
          </Field>
          <Field label="In one sentence, what does it do?">
            <Textarea
              rows={2}
              value={form.description}
              onChange={(v) => setForm({ ...form, description: v })}
              placeholder="e.g. Turns a long email into 3 clear bullet points."
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Category">
              <Select
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                options={[
                  ['nlp', 'Text & language'],
                  ['productivity', 'Productivity'],
                  ['trading', 'Trading'],
                  ['scraping', 'Web data'],
                ]}
              />
            </Field>
            <Field label="Pricing">
              <Select
                value={form.pricingModel}
                onChange={(v) => setForm({ ...form, pricingModel: v })}
                options={[
                  ['FREE', 'Free'],
                  ['PER_EXECUTION', 'Pay per run'],
                  ['SUBSCRIPTION', 'Monthly'],
                  ['PAID', 'One-off'],
                ]}
              />
            </Field>
          </div>
          {form.pricingModel !== 'FREE' && (
            <Field label="Price (USD)">
              <Input
                type="number"
                value={String(form.price)}
                onChange={(v) => setForm({ ...form, price: Number(v) })}
              />
            </Field>
          )}
          <div className="flex justify-end">
            <Button
              onClick={() => setStep('code')}
              disabled={!form.name || !form.description || !userId}
              trailingArrow
            >
              Next · Add code
            </Button>
          </div>
        </div>
      )}

      {step === 'code' && (
        <div className="surface space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold">Add the skill code</h2>
          <p className="text-sm text-fg-secondary">
            Python. Define a <code className="rounded bg-white/5 px-1">run(inputs, ctx)</code> function
            that returns a dictionary. Runs in an isolated sandbox.
          </p>
          <Textarea
            rows={12}
            value={form.code}
            onChange={(v) => setForm({ ...form, code: v })}
            className="font-mono text-xs"
          />
          <div className="flex justify-between">
            <Button onClick={() => setStep('basics')} variant="secondary">
              Back
            </Button>
            <Button onClick={() => setStep('permissions')} trailingArrow>
              Next · Set permissions
            </Button>
          </div>
        </div>
      )}

      {step === 'permissions' && (
        <div className="surface space-y-5 p-6">
          <h2 className="font-display text-lg font-semibold">What does it need access to?</h2>
          <p className="text-sm text-fg-secondary">
            The less you ask for, the more users will trust it.
          </p>
          <Field label="Allowed websites (one per line)">
            <Textarea
              rows={3}
              value={form.permissions.allowedDomains.join('\n')}
              onChange={(v) =>
                setForm({
                  ...form,
                  permissions: {
                    ...form.permissions,
                    allowedDomains: v.split('\n').map((x) => x.trim()).filter(Boolean),
                  },
                })
              }
              placeholder="e.g. en.wikipedia.org"
            />
          </Field>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Field label="Max web requests per run">
              <Input
                type="number"
                value={String(form.permissions.maxApiCalls)}
                onChange={(v) =>
                  setForm({
                    ...form,
                    permissions: { ...form.permissions, maxApiCalls: Number(v) },
                  })
                }
              />
            </Field>
            <Field label="Timeout (seconds)">
              <Input
                type="number"
                value={String(form.permissions.timeoutSec)}
                onChange={(v) =>
                  setForm({
                    ...form,
                    permissions: { ...form.permissions, timeoutSec: Number(v) },
                  })
                }
              />
            </Field>
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-line bg-bg p-4">
            <input
              type="checkbox"
              className="mt-1 accent-accent"
              checked={form.permissions.walletAccess}
              onChange={(e) =>
                setForm({
                  ...form,
                  permissions: { ...form.permissions, walletAccess: e.target.checked },
                })
              }
            />
            <div>
              <div className="text-sm text-fg">This skill needs wallet access</div>
              <div className="text-xs text-fg-muted">
                Rare. Only enable if your skill legitimately needs to read wallet data.
              </div>
            </div>
          </label>
          <div className="flex justify-between">
            <Button onClick={() => setStep('code')} variant="secondary">
              Back
            </Button>
            <Button onClick={() => setStep('review')} trailingArrow>
              Next · Review
            </Button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="surface space-y-4 p-6">
          <h2 className="font-display text-lg font-semibold">One last look</h2>
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
            <Button onClick={() => setStep('permissions')} variant="secondary">
              Back
            </Button>
            <Button onClick={publish} trailingArrow>
              Publish skill
            </Button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div className="surface space-y-4 p-6">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            Published. Now run a safety audit so users can trust it.
          </div>
          <div className="flex flex-wrap gap-2">
            <Button href={`/skills/${result.id}`} variant="secondary" trailingArrow>
              View skill page
            </Button>
            <Button onClick={audit} disabled={auditing} trailingArrow>
              {auditing ? 'Running audit…' : 'Run safety audit'}
            </Button>
          </div>
          {auditResult && (
            <div className="rounded-xl border border-line bg-bg p-4 text-sm">
              <div className="text-fg">
                Certification:{' '}
                <span className="font-medium text-accent-glow">
                  {auditResult.certification}
                </span>
              </div>
              <details className="mt-2 text-xs text-fg-muted">
                <summary className="cursor-pointer hover:text-fg-secondary">
                  View detailed audit report
                </summary>
                <pre className="mt-2 max-h-72 overflow-auto rounded bg-bg-sunken p-2 text-[11px] text-fg-secondary">
                  {JSON.stringify(auditResult, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- tiny form primitives (local, not shared) ---------- */

const inputCls =
  'w-full rounded-xl border border-line bg-bg px-3 py-2 text-sm text-fg outline-none transition focus:border-line-strong placeholder:text-fg-muted';

function Input({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  rows = 3,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputCls} ${className}`}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputCls}
    >
      {options.map(([v, label]) => (
        <option key={v} value={v}>
          {label}
        </option>
      ))}
    </select>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs text-fg-secondary">{label}</span>
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
      <dt className="text-[11px] uppercase tracking-[0.18em] text-fg-muted">{label}</dt>
      <dd className="mt-0.5 text-fg">
        {value || <span className="text-fg-muted">—</span>}
      </dd>
    </div>
  );
}

function Progress({ step }: { step: Step }) {
  const idx = STEPS.findIndex((s) => s.key === step);
  return (
    <ol className="flex flex-wrap items-center gap-2 text-xs">
      {STEPS.map((s, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={`inline-flex h-6 w-6 items-center justify-center rounded-full border text-[11px] ${
                done
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                  : active
                  ? 'border-fg bg-fg text-bg'
                  : 'border-line text-fg-muted'
              }`}
            >
              {done ? '✓' : i + 1}
            </span>
            <span className={active ? 'text-fg' : 'text-fg-muted'}>{s.label}</span>
            {i < STEPS.length - 1 && <span className="text-fg-dim">—</span>}
          </li>
        );
      })}
    </ol>
  );
}
