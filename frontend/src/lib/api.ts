const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function req<T>(path: string, init?: RequestInit & { userId?: string }): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('content-type', 'application/json');
  if (init?.userId) headers.set('x-user-id', init.userId);
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers,
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export type Skill = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  pricingModel: 'FREE' | 'PAID' | 'SUBSCRIPTION' | 'PER_EXECUTION';
  price: string;
  isFree: boolean;
  certification:
    | 'UNVERIFIED'
    | 'FUNCTION_VERIFIED'
    | 'PERFORMANCE_VERIFIED'
    | 'SECURITY_AUDITED'
    | 'BATTLE_TESTED';
  riskScore: number;
  performanceScore: number;
  ratingAvg: number;
  ratingCount: number;
  totalExecutions: number;
  successRate: number;
  avgLatencyMs: number;
  isDisabled: boolean;
  killSwitch: boolean;
  creator: { id: string; name: string };
  permissionsRequired: Record<string, unknown>;
};

export const api = {
  listSkills: (params: Record<string, string> = {}) => {
    const q = new URLSearchParams(params).toString();
    return req<{ items: Skill[]; total: number; page: number; limit: number }>(
      `/skills${q ? `?${q}` : ''}`,
    );
  },
  getSkill: (id: string) => req<Skill & Record<string, any>>(`/skills/${id}`),
  getSkillBySlug: (slug: string) => req<Skill & Record<string, any>>(`/skills/slug/${slug}`),
  executeSkill: (id: string, inputs: Record<string, unknown>, userId?: string) =>
    req<any>(`/skills/${id}/execute`, {
      method: 'POST',
      body: JSON.stringify({ inputs }),
      userId,
    }),
  reviewsForSkill: (id: string) => req<any[]>(`/skills/${id}/reviews`),
  createReview: (
    body: { skillId: string; executionId: string; rating: number; body?: string },
    userId: string,
  ) =>
    req<any>(`/reviews`, {
      method: 'POST',
      body: JSON.stringify(body),
      userId,
    }),
  auditForSkill: (id: string) => req<any[]>(`/skills/${id}/audit`),
  runAudit: (id: string) => req<any>(`/skills/${id}/audit`, { method: 'POST' }),
  getCreator: (id: string) => req<any>(`/creators/${id}`),
  executionLogs: (id: string) => req<any>(`/executions/${id}/logs`),
};

export const certBadge = (c: Skill['certification']) => {
  switch (c) {
    case 'BATTLE_TESTED':
      return { label: 'Battle Tested', color: 'bg-emerald-600' };
    case 'SECURITY_AUDITED':
      return { label: 'Security Audited', color: 'bg-emerald-500' };
    case 'PERFORMANCE_VERIFIED':
      return { label: 'Performance Verified', color: 'bg-blue-500' };
    case 'FUNCTION_VERIFIED':
      return { label: 'Function Verified', color: 'bg-amber-500' };
    default:
      return { label: 'Unverified', color: 'bg-zinc-500' };
  }
};
