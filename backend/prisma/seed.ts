import { PrismaClient, PricingModel, CertificationStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@skillz.dev' },
    update: {},
    create: {
      email: 'alice@skillz.dev',
      name: 'Alice Chen',
      isAdmin: true,
      bio: 'Quant researcher building deterministic trading skills.',
    },
  });
  const bob = await prisma.user.upsert({
    where: { email: 'bob@skillz.dev' },
    update: {},
    create: {
      email: 'bob@skillz.dev',
      name: 'Bob Singh',
      bio: 'Web scraping & data extraction specialist.',
    },
  });
  const carol = await prisma.user.upsert({
    where: { email: 'carol@skillz.dev' },
    update: {},
    create: {
      email: 'carol@skillz.dev',
      name: 'Carol Diaz',
      bio: 'NLP toolkits, summarisers, classifiers.',
    },
  });

  const seedSkills = [
    {
      creatorId: alice.id,
      name: 'Mean Reversion Scout',
      slug: 'mean-reversion-scout',
      description: 'Detects 2-sigma deviations in 1-minute price series and emits buy/sell signals.',
      category: 'trading',
      tags: ['trading', 'signals', 'equities'],
      pricingModel: PricingModel.PER_EXECUTION,
      price: 0.05,
      isFree: false,
      certification: CertificationStatus.SECURITY_AUDITED,
      ratingAvg: 4.6,
      ratingCount: 24,
      totalExecutions: 312,
      successRate: 0.94,
      avgLatencyMs: 220,
      performanceScore: 88,
      riskScore: 18,
      permissionsRequired: {
        allowedDomains: ['api.example-market.com'],
        allowedActions: ['read_market_data'],
        maxApiCalls: 20,
        maxSpendUsd: 0,
        walletAccess: false,
        timeoutSec: 10,
        memoryMb: 256,
      },
      code: `# mean reversion scout
def run(inputs, ctx):
    series = inputs.get("prices", [])
    if not series: return {"signal": "hold"}
    mean = sum(series) / len(series)
    last = series[-1]
    if last < mean * 0.98: return {"signal": "buy", "edge_bps": int((mean-last)/mean*10000)}
    if last > mean * 1.02: return {"signal": "sell", "edge_bps": int((last-mean)/mean*10000)}
    return {"signal": "hold"}
`,
    },
    {
      creatorId: bob.id,
      name: 'Wikipedia Distiller',
      slug: 'wikipedia-distiller',
      description: 'Fetches a Wikipedia article and returns a 5-bullet summary.',
      category: 'scraping',
      tags: ['scraping', 'summarisation', 'free'],
      pricingModel: PricingModel.FREE,
      price: 0,
      isFree: true,
      certification: CertificationStatus.PERFORMANCE_VERIFIED,
      ratingAvg: 4.3,
      ratingCount: 51,
      totalExecutions: 980,
      successRate: 0.91,
      avgLatencyMs: 540,
      performanceScore: 79,
      riskScore: 22,
      permissionsRequired: {
        allowedDomains: ['en.wikipedia.org'],
        allowedActions: ['http_get'],
        maxApiCalls: 3,
        maxSpendUsd: 0,
        walletAccess: false,
        timeoutSec: 15,
        memoryMb: 256,
      },
      code: `def run(inputs, ctx):
    title = inputs.get("title", "")
    if not title: return {"error": "missing title"}
    text = ctx.http_get(f"https://en.wikipedia.org/wiki/{title}")
    bullets = [line.strip() for line in text.split(".") if len(line.strip()) > 40][:5]
    return {"title": title, "bullets": bullets}
`,
    },
    {
      creatorId: carol.id,
      name: 'Sentiment Pulse',
      slug: 'sentiment-pulse',
      description: 'Tags an input string as positive / neutral / negative with a confidence score.',
      category: 'nlp',
      tags: ['nlp', 'sentiment', 'free'],
      pricingModel: PricingModel.FREE,
      price: 0,
      isFree: true,
      certification: CertificationStatus.FUNCTION_VERIFIED,
      ratingAvg: 4.0,
      ratingCount: 12,
      totalExecutions: 142,
      successRate: 0.88,
      avgLatencyMs: 60,
      performanceScore: 64,
      riskScore: 9,
      permissionsRequired: {
        allowedDomains: [],
        allowedActions: [],
        maxApiCalls: 0,
        maxSpendUsd: 0,
        walletAccess: false,
        timeoutSec: 5,
        memoryMb: 128,
      },
      code: `POS = {"good","great","love","amazing","excellent","positive"}
NEG = {"bad","terrible","hate","awful","negative","poor"}
def run(inputs, ctx):
    text = (inputs.get("text") or "").lower()
    words = set(text.split())
    p, n = len(words & POS), len(words & NEG)
    if p == n: return {"label": "neutral", "confidence": 0.5}
    if p > n:  return {"label": "positive", "confidence": min(0.5+0.1*(p-n), 0.99)}
    return {"label": "negative", "confidence": min(0.5+0.1*(n-p), 0.99)}
`,
    },
    {
      creatorId: carol.id,
      name: 'Email Drafter',
      slug: 'email-drafter',
      description: 'Generates a polite outreach email from a prompt and recipient profile.',
      category: 'productivity',
      tags: ['email', 'productivity'],
      pricingModel: PricingModel.SUBSCRIPTION,
      price: 9.99,
      isFree: false,
      certification: CertificationStatus.UNVERIFIED,
      ratingAvg: 0,
      ratingCount: 0,
      totalExecutions: 0,
      permissionsRequired: {
        allowedDomains: [],
        allowedActions: ['compose'],
        maxApiCalls: 0,
        maxSpendUsd: 0,
        walletAccess: false,
        timeoutSec: 5,
        memoryMb: 128,
      },
      code: `def run(inputs, ctx):
    name = inputs.get("recipient_name","there")
    topic = inputs.get("topic","quick chat")
    return {"subject": f"Quick note about {topic}",
            "body": f"Hi {name},\\n\\nHope you're well. Wanted to reach out about {topic}.\\n\\nBest,\\nMe"}
`,
    },
  ];

  for (const s of seedSkills) {
    const existing = await prisma.skill.findUnique({ where: { slug: s.slug } });
    if (existing) continue;
    await prisma.skill.create({
      data: {
        creatorId: s.creatorId,
        name: s.name,
        slug: s.slug,
        description: s.description,
        category: s.category,
        tags: s.tags,
        pricingModel: s.pricingModel,
        price: s.price,
        isFree: s.isFree,
        certification: s.certification,
        ratingAvg: s.ratingAvg,
        ratingCount: s.ratingCount,
        totalExecutions: s.totalExecutions,
        successRate: s.successRate ?? 0,
        avgLatencyMs: s.avgLatencyMs ?? 0,
        performanceScore: s.performanceScore ?? 0,
        riskScore: s.riskScore ?? 0,
        permissionsRequired: s.permissionsRequired as any,
        versions: {
          create: { version: 1, code: s.code, manifest: { entry: 'run' } as any },
        },
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
