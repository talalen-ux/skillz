import { api } from '@/lib/api';
import { SkillCard } from '@/components/SkillCard';

export const dynamic = 'force-dynamic';

export default async function FreeHubPage() {
  let data: Awaited<ReturnType<typeof api.listSkills>> | null = null;
  try {
    data = await api.listSkills({ pricingModel: 'FREE', sort: 'popular', limit: '24' });
  } catch (e) {}
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-8">
        <h1 className="text-2xl font-bold">Free Skills Hub</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Open-access skills with no paywall. Perfect for trying things out and
          contributing back via the Collaborative Hub.
        </p>
      </div>
      {!data || data.items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-300 p-8 text-center text-sm text-zinc-500">
          No free skills published yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((s) => (
            <SkillCard key={s.id} skill={s} />
          ))}
        </div>
      )}
    </div>
  );
}
