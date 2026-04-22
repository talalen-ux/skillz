import {
  PrismaClient,
  PricingModel,
  CertificationStatus,
  ExecutionStatus,
} from '@prisma/client';
import { createHash } from 'crypto';

const prisma = new PrismaClient();

/** Minimal-but-valid Python so the harness contract is respected. */
const stubCode = (body: string) => `def run(inputs, ctx):\n${body
  .split('\n')
  .map((l) => '    ' + l)
  .join('\n')}\n`;

type CreatorSeed = { key: string; email: string; name: string; bio: string; isAdmin?: boolean };
type SkillSeed = {
  slug: string;
  name: string;
  description: string;
  category: string;
  creator: string; // creator key
  tags: string[];
  pricingModel: PricingModel;
  price?: number;
  certification: CertificationStatus;
  ratingAvg: number;
  ratingCount: number;
  totalExecutions: number;
  successRate: number;
  avgLatencyMs: number;
  performanceScore: number;
  riskScore: number;
  permissions: {
    allowedDomains?: string[];
    allowedActions?: string[];
    maxApiCalls?: number;
    maxSpendUsd?: number;
    walletAccess?: boolean;
    timeoutSec?: number;
    memoryMb?: number;
  };
  code: string;
  /** Optional review copy to seed under this skill. */
  reviews?: { rating: number; body: string; reviewer: string }[];
};

const CREATORS: CreatorSeed[] = [
  {
    key: 'alice',
    email: 'alice@skillz.dev',
    name: 'Alice Chen',
    isAdmin: true,
    bio: 'Quant researcher building deterministic, auditable trading skills.',
  },
  {
    key: 'bob',
    email: 'bob@skillz.dev',
    name: 'Bob Singh',
    bio: 'Data engineer. Turns the messy web into clean, structured feeds.',
  },
  {
    key: 'carol',
    email: 'carol@skillz.dev',
    name: 'Carol Diaz',
    bio: 'NLP toolkits — classifiers, summarisers, and writing assistants.',
  },
  {
    key: 'david',
    email: 'david@skillz.dev',
    name: 'David Park',
    bio: 'Smart-contract security researcher. Formerly at a major L2.',
  },
  {
    key: 'emma',
    email: 'emma@skillz.dev',
    name: 'Emma Ruiz',
    bio: 'Content marketer turned AI builder. Ships tools that actually move metrics.',
  },
  {
    key: 'frank',
    email: 'frank@skillz.dev',
    name: 'Frank Okafor',
    bio: 'DevOps lead. Skills that take the boring work off your plate.',
  },
  {
    key: 'grace',
    email: 'grace@skillz.dev',
    name: 'Grace Lin',
    bio: 'Research librarian — surfaces the sources behind every claim.',
  },
  {
    key: 'hana',
    email: 'hana@skillz.dev',
    name: 'Hana Müller',
    bio: 'Legal engineer. Reads the fine print so you do not have to.',
  },
];

const SKILLS: SkillSeed[] = [
  // -------------------- TRADING --------------------
  {
    slug: 'market-sentiment-analyzer',
    name: 'Market Sentiment Analyzer',
    description: 'Real-time sentiment analysis across markets and news sources.',
    category: 'trading',
    creator: 'alice',
    tags: ['trading', 'sentiment', 'real-time', 'featured'],
    pricingModel: PricingModel.PER_EXECUTION,
    price: 0.08,
    certification: CertificationStatus.SECURITY_AUDITED,
    ratingAvg: 4.9,
    ratingCount: 412,
    totalExecutions: 12400,
    successRate: 0.96,
    avgLatencyMs: 340,
    performanceScore: 93,
    riskScore: 14,
    permissions: {
      allowedDomains: ['api.cryptocompare.com', 'api.newsapi.org'],
      allowedActions: ['read_market_data', 'read_news'],
      maxApiCalls: 20,
      timeoutSec: 15,
      memoryMb: 256,
    },
    code: stubCode(
      'symbols = inputs.get("symbols", ["BTC","ETH"])\nreturn {"scores": {s: {"sentiment": "bullish", "confidence": 0.72} for s in symbols}}',
    ),
    reviews: [
      {
        rating: 5,
        body: 'Part of my morning routine now. The sector breakdown is what sold me.',
        reviewer: 'emma',
      },
      {
        rating: 5,
        body: 'Replaced three subscriptions with this. Cited sources is a huge plus.',
        reviewer: 'frank',
      },
      { rating: 4, body: 'Fast and accurate, wish it covered more altcoins.', reviewer: 'bob' },
    ],
  },
  {
    slug: 'mean-reversion-scout',
    name: 'Mean Reversion Scout',
    description:
      'Detects 2-sigma deviations in 1-minute price series and emits buy/sell signals.',
    category: 'trading',
    creator: 'alice',
    tags: ['trading', 'signals', 'equities'],
    pricingModel: PricingModel.PER_EXECUTION,
    price: 0.05,
    certification: CertificationStatus.BATTLE_TESTED,
    ratingAvg: 4.7,
    ratingCount: 284,
    totalExecutions: 8_920,
    successRate: 0.94,
    avgLatencyMs: 220,
    performanceScore: 91,
    riskScore: 18,
    permissions: {
      allowedDomains: ['api.example-market.com'],
      allowedActions: ['read_market_data'],
      maxApiCalls: 20,
      timeoutSec: 10,
      memoryMb: 256,
    },
    code: stubCode(
      'prices = inputs.get("prices", [])\nif not prices: return {"signal": "hold"}\nm = sum(prices)/len(prices); last = prices[-1]\nif last < m*0.98: return {"signal": "buy", "edge_bps": int((m-last)/m*10000)}\nif last > m*1.02: return {"signal": "sell", "edge_bps": int((last-m)/m*10000)}\nreturn {"signal": "hold"}',
    ),
  },
  {
    slug: 'smart-contract-auditor',
    name: 'Smart Contract Auditor',
    description: 'Detects vulnerabilities and risks in smart contracts before you deploy.',
    category: 'trading',
    creator: 'david',
    tags: ['security', 'smart-contracts', 'audit', 'featured'],
    pricingModel: PricingModel.PER_EXECUTION,
    price: 0.5,
    certification: CertificationStatus.SECURITY_AUDITED,
    ratingAvg: 4.8,
    ratingCount: 318,
    totalExecutions: 8_700,
    successRate: 0.97,
    avgLatencyMs: 1_240,
    performanceScore: 89,
    riskScore: 12,
    permissions: {
      allowedDomains: ['api.etherscan.io'],
      allowedActions: ['read_contract', 'analyze_bytecode'],
      maxApiCalls: 15,
      timeoutSec: 45,
      memoryMb: 512,
    },
    code: stubCode(
      'addr = inputs.get("address", "")\nif not addr.startswith("0x"): return {"error": "invalid address"}\nreturn {"address": addr, "findings": [{"severity": "medium", "rule": "reentrancy", "line": 42}], "score": 78}',
    ),
    reviews: [
      {
        rating: 5,
        body: 'Found a reentrancy pattern I would have missed. Worth the price.',
        reviewer: 'alice',
      },
    ],
  },
  {
    slug: 'defi-yield-optimizer',
    name: 'DeFi Yield Optimizer',
    description: 'Finds the safest high-yield pools across major L1s and L2s.',
    category: 'trading',
    creator: 'david',
    tags: ['defi', 'yield', 'portfolio'],
    pricingModel: PricingModel.SUBSCRIPTION,
    price: 29,
    certification: CertificationStatus.PERFORMANCE_VERIFIED,
    ratingAvg: 4.5,
    ratingCount: 142,
    totalExecutions: 4_200,
    successRate: 0.92,
    avgLatencyMs: 680,
    performanceScore: 82,
    riskScore: 22,
    permissions: {
      allowedDomains: ['api.defillama.com'],
      allowedActions: ['read_pools'],
      maxApiCalls: 20,
      timeoutSec: 30,
      memoryMb: 256,
    },
    code: stubCode(
      'return {"top_pools": [{"name": "stETH/ETH", "apy": 4.2, "tvl_usd": 2_300_000_000, "risk": "low"}]}',
    ),
  },
  {
    slug: 'whale-wallet-tracker',
    name: 'Whale Wallet Tracker',
    description: 'Alerts you when tracked wallets buy or sell tokens.',
    category: 'trading',
    creator: 'alice',
    tags: ['wallet', 'alerts', 'on-chain'],
    pricingModel: PricingModel.PER_EXECUTION,
    price: 0.02,
    certification: CertificationStatus.PERFORMANCE_VERIFIED,
    ratingAvg: 4.6,
    ratingCount: 201,
    totalExecutions: 11_300,
    successRate: 0.93,
    avgLatencyMs: 410,
    performanceScore: 84,
    riskScore: 16,
    permissions: {
      allowedDomains: ['api.etherscan.io'],
      allowedActions: ['read_wallet'],
      maxApiCalls: 10,
      timeoutSec: 20,
      memoryMb: 128,
    },
    code: stubCode(
      'wallets = inputs.get("wallets", [])\nreturn {"events": [{"wallet": w, "action": "buy", "symbol": "PEPE", "usd": 120_000} for w in wallets[:1]]}',
    ),
  },

  // -------------------- RESEARCH / NLP --------------------
  {
    slug: 'ai-research-assistant',
    name: 'AI Research Assistant',
    description: 'Deep research across the web with cited, verifiable sources.',
    category: 'nlp',
    creator: 'grace',
    tags: ['research', 'sources', 'writing', 'featured'],
    pricingModel: PricingModel.SUBSCRIPTION,
    price: 19,
    certification: CertificationStatus.BATTLE_TESTED,
    ratingAvg: 4.9,
    ratingCount: 627,
    totalExecutions: 15_200,
    successRate: 0.95,
    avgLatencyMs: 2_100,
    performanceScore: 92,
    riskScore: 10,
    permissions: {
      allowedDomains: ['en.wikipedia.org', 'scholar.google.com', 'arxiv.org'],
      allowedActions: ['http_get'],
      maxApiCalls: 25,
      timeoutSec: 60,
      memoryMb: 512,
    },
    code: stubCode(
      'q = inputs.get("question", "")\nif not q: return {"error": "missing question"}\nreturn {"answer": "Summary of findings.", "sources": [{"title": "Example", "url": "https://en.wikipedia.org/wiki/Example"}]}',
    ),
    reviews: [
      {
        rating: 5,
        body: 'The citations are what make this. Final drafts are faster and defensible.',
        reviewer: 'carol',
      },
      {
        rating: 5,
        body: 'Use this every day for briefings. The sources it picks are surprisingly good.',
        reviewer: 'hana',
      },
      { rating: 4, body: 'Occasionally slow on long questions but worth the wait.', reviewer: 'frank' },
    ],
  },
  {
    slug: 'content-creator-pro',
    name: 'Content Creator Pro',
    description: 'Generate high-quality content that ranks and converts.',
    category: 'nlp',
    creator: 'emma',
    tags: ['content', 'seo', 'marketing', 'featured'],
    pricingModel: PricingModel.SUBSCRIPTION,
    price: 24,
    certification: CertificationStatus.SECURITY_AUDITED,
    ratingAvg: 4.8,
    ratingCount: 389,
    totalExecutions: 9_100,
    successRate: 0.94,
    avgLatencyMs: 1_800,
    performanceScore: 88,
    riskScore: 13,
    permissions: {
      allowedActions: ['compose'],
      timeoutSec: 30,
      memoryMb: 256,
    },
    code: stubCode(
      'topic = inputs.get("topic", "AI")\nreturn {"title": f"The definitive guide to {topic}", "outline": ["Why it matters","What works","Common mistakes","What to do next"], "words": 1800}',
    ),
    reviews: [
      {
        rating: 5,
        body: 'Outlines are tight. SEO angle is not an afterthought — it actually helps.',
        reviewer: 'grace',
      },
    ],
  },
  {
    slug: 'sentiment-pulse',
    name: 'Sentiment Pulse',
    description: 'Lightweight positive / neutral / negative classifier with confidence scores.',
    category: 'nlp',
    creator: 'carol',
    tags: ['nlp', 'sentiment', 'free'],
    pricingModel: PricingModel.FREE,
    certification: CertificationStatus.FUNCTION_VERIFIED,
    ratingAvg: 4.2,
    ratingCount: 58,
    totalExecutions: 2_400,
    successRate: 0.9,
    avgLatencyMs: 60,
    performanceScore: 72,
    riskScore: 9,
    permissions: { timeoutSec: 5, memoryMb: 128 },
    code: stubCode(
      'POS = {"good","great","love","amazing","excellent"}\nNEG = {"bad","terrible","hate","awful","poor"}\nt = (inputs.get("text") or "").lower().split()\np = len(set(t) & POS); n = len(set(t) & NEG)\nif p == n: return {"label":"neutral","confidence":0.5}\nif p > n: return {"label":"positive","confidence": min(0.5+0.1*(p-n),0.99)}\nreturn {"label":"negative","confidence": min(0.5+0.1*(n-p),0.99)}',
    ),
  },
  {
    slug: 'contract-clause-finder',
    name: 'Contract Clause Finder',
    description: 'Flags risky clauses in legal contracts — indemnification, liability, auto-renew.',
    category: 'nlp',
    creator: 'hana',
    tags: ['legal', 'contracts', 'review'],
    pricingModel: PricingModel.PER_EXECUTION,
    price: 0.25,
    certification: CertificationStatus.SECURITY_AUDITED,
    ratingAvg: 4.7,
    ratingCount: 133,
    totalExecutions: 3_800,
    successRate: 0.96,
    avgLatencyMs: 520,
    performanceScore: 87,
    riskScore: 11,
    permissions: { timeoutSec: 20, memoryMb: 256 },
    code: stubCode(
      'text = inputs.get("text","")\nflags = []\nfor phrase in ["indemnify","liability","auto-renew","exclusive"]:\n    if phrase in text.lower(): flags.append({"phrase": phrase, "severity":"medium"})\nreturn {"flags": flags, "count": len(flags)}',
    ),
    reviews: [
      {
        rating: 5,
        body: 'Caught an auto-renew buried in page 14. Paid for itself on the first contract.',
        reviewer: 'emma',
      },
    ],
  },
  {
    slug: 'meeting-summariser',
    name: 'Meeting Summariser',
    description: 'Turns 60 minutes of transcript into owner · action · due-date bullets.',
    category: 'nlp',
    creator: 'carol',
    tags: ['meetings', 'productivity', 'transcripts'],
    pricingModel: PricingModel.PER_EXECUTION,
    price: 0.1,
    certification: CertificationStatus.PERFORMANCE_VERIFIED,
    ratingAvg: 4.6,
    ratingCount: 244,
    totalExecutions: 7_900,
    successRate: 0.93,
    avgLatencyMs: 960,
    performanceScore: 85,
    riskScore: 14,
    permissions: { timeoutSec: 20, memoryMb: 256 },
    code: stubCode(
      'return {"summary": "Discussed Q4 roadmap.", "actions": [{"owner": "Alex", "task": "Draft OKRs", "due": "2026-05-02"}]}',
    ),
  },

  // -------------------- WEB DATA / SCRAPING --------------------
  {
    slug: 'wikipedia-distiller',
    name: 'Wikipedia Distiller',
    description: 'Fetches a Wikipedia article and returns a 5-bullet summary.',
    category: 'scraping',
    creator: 'bob',
    tags: ['scraping', 'summarisation', 'free'],
    pricingModel: PricingModel.FREE,
    certification: CertificationStatus.PERFORMANCE_VERIFIED,
    ratingAvg: 4.4,
    ratingCount: 178,
    totalExecutions: 12_800,
    successRate: 0.91,
    avgLatencyMs: 540,
    performanceScore: 79,
    riskScore: 18,
    permissions: {
      allowedDomains: ['en.wikipedia.org'],
      allowedActions: ['http_get'],
      maxApiCalls: 3,
      timeoutSec: 15,
      memoryMb: 256,
    },
    code: stubCode(
      'title = inputs.get("title","")\nif not title: return {"error": "missing title"}\ntext = ctx.http_get(f"https://en.wikipedia.org/wiki/{title}")\nbullets = [l.strip() for l in text.split(".") if len(l.strip()) > 40][:5]\nreturn {"title": title, "bullets": bullets}',
    ),
  },
  {
    slug: 'product-review-harvester',
    name: 'Product Review Harvester',
    description: 'Pulls verified reviews and scores a product\'s strengths and weaknesses.',
    category: 'scraping',
    creator: 'bob',
    tags: ['reviews', 'ecommerce', 'analysis'],
    pricingModel: PricingModel.PER_EXECUTION,
    price: 0.15,
    certification: CertificationStatus.PERFORMANCE_VERIFIED,
    ratingAvg: 4.5,
    ratingCount: 97,
    totalExecutions: 5_600,
    successRate: 0.9,
    avgLatencyMs: 1_200,
    performanceScore: 81,
    riskScore: 19,
    permissions: {
      allowedDomains: ['trustpilot.com', 'reviews.example.com'],
      allowedActions: ['http_get'],
      maxApiCalls: 10,
      timeoutSec: 30,
      memoryMb: 256,
    },
    code: stubCode(
      'return {"product": inputs.get("product",""), "score": 4.3, "pros": ["battery","build"], "cons": ["price"]}',
    ),
  },
  {
    slug: 'competitive-pricing-monitor',
    name: 'Competitive Pricing Monitor',
    description: 'Tracks competitor pricing changes and alerts you to drops.',
    category: 'scraping',
    creator: 'bob',
    tags: ['pricing', 'monitoring', 'ecommerce'],
    pricingModel: PricingModel.SUBSCRIPTION,
    price: 12,
    certification: CertificationStatus.FUNCTION_VERIFIED,
    ratingAvg: 4.3,
    ratingCount: 64,
    totalExecutions: 3_100,
    successRate: 0.88,
    avgLatencyMs: 820,
    performanceScore: 75,
    riskScore: 24,
    permissions: {
      allowedDomains: ['example-shop.com'],
      allowedActions: ['http_get'],
      maxApiCalls: 10,
      timeoutSec: 30,
      memoryMb: 256,
    },
    code: stubCode(
      'skus = inputs.get("skus", [])\nreturn {"changes": [{"sku": s, "before": 99.0, "after": 89.0} for s in skus[:1]]}',
    ),
  },
  {
    slug: 'job-board-aggregator',
    name: 'Job Board Aggregator',
    description: 'Aggregates roles matching your filters across 50+ boards, deduplicated.',
    category: 'scraping',
    creator: 'frank',
    tags: ['jobs', 'aggregation', 'free'],
    pricingModel: PricingModel.FREE,
    certification: CertificationStatus.FUNCTION_VERIFIED,
    ratingAvg: 4.1,
    ratingCount: 40,
    totalExecutions: 1_850,
    successRate: 0.89,
    avgLatencyMs: 1_100,
    performanceScore: 73,
    riskScore: 22,
    permissions: {
      allowedDomains: ['remoteok.com', 'weworkremotely.com'],
      allowedActions: ['http_get'],
      maxApiCalls: 10,
      timeoutSec: 30,
      memoryMb: 256,
    },
    code: stubCode(
      'return {"roles": [{"title": "Senior Engineer", "company": "Acme", "location": "Remote"}]}',
    ),
  },

  // -------------------- PRODUCTIVITY --------------------
  {
    slug: 'email-drafter',
    name: 'Email Drafter',
    description: 'Drafts polite, on-brand outreach emails from a one-line prompt.',
    category: 'productivity',
    creator: 'carol',
    tags: ['email', 'productivity'],
    pricingModel: PricingModel.SUBSCRIPTION,
    price: 9,
    certification: CertificationStatus.FUNCTION_VERIFIED,
    ratingAvg: 4.4,
    ratingCount: 87,
    totalExecutions: 4_200,
    successRate: 0.92,
    avgLatencyMs: 420,
    performanceScore: 78,
    riskScore: 12,
    permissions: { allowedActions: ['compose'], timeoutSec: 10, memoryMb: 128 },
    code: stubCode(
      'name = inputs.get("recipient_name","there"); topic = inputs.get("topic","quick chat")\nreturn {"subject": f"Quick note about {topic}", "body": f"Hi {name},\\n\\nHope you\'re well. Wanted to reach out about {topic}.\\n\\nBest,\\nMe"}',
    ),
  },
  {
    slug: 'calendar-deconflictor',
    name: 'Calendar Deconflictor',
    description: 'Proposes meeting times that work for everyone — no more back-and-forth.',
    category: 'productivity',
    creator: 'frank',
    tags: ['calendar', 'scheduling', 'free'],
    pricingModel: PricingModel.FREE,
    certification: CertificationStatus.PERFORMANCE_VERIFIED,
    ratingAvg: 4.6,
    ratingCount: 152,
    totalExecutions: 6_800,
    successRate: 0.94,
    avgLatencyMs: 180,
    performanceScore: 84,
    riskScore: 10,
    permissions: { timeoutSec: 10, memoryMb: 128 },
    code: stubCode(
      'return {"suggestions": ["Tue 10:00","Wed 14:00","Thu 09:30"]}',
    ),
    reviews: [
      {
        rating: 5,
        body: 'Finally. No more Doodle polls. Attaches to any calendar I throw at it.',
        reviewer: 'alice',
      },
    ],
  },
  {
    slug: 'slack-digest',
    name: 'Slack Digest',
    description: 'A 7am digest of the channel activity that actually matters to you.',
    category: 'productivity',
    creator: 'frank',
    tags: ['slack', 'digest', 'communication'],
    pricingModel: PricingModel.SUBSCRIPTION,
    price: 6,
    certification: CertificationStatus.PERFORMANCE_VERIFIED,
    ratingAvg: 4.5,
    ratingCount: 118,
    totalExecutions: 5_400,
    successRate: 0.95,
    avgLatencyMs: 260,
    performanceScore: 83,
    riskScore: 15,
    permissions: {
      allowedDomains: ['slack.com'],
      allowedActions: ['read_channel'],
      maxApiCalls: 20,
      timeoutSec: 30,
      memoryMb: 256,
    },
    code: stubCode(
      'return {"highlights": [{"channel":"#eng","summary":"Release 2.4 shipped, 1 hotfix pending"}]}',
    ),
  },
  {
    slug: 'pr-review-buddy',
    name: 'PR Review Buddy',
    description: 'Explains PR diffs in plain English and flags what you might miss.',
    category: 'productivity',
    creator: 'frank',
    tags: ['code-review', 'github', 'engineering'],
    pricingModel: PricingModel.PER_EXECUTION,
    price: 0.03,
    certification: CertificationStatus.SECURITY_AUDITED,
    ratingAvg: 4.7,
    ratingCount: 205,
    totalExecutions: 8_400,
    successRate: 0.94,
    avgLatencyMs: 720,
    performanceScore: 86,
    riskScore: 13,
    permissions: {
      allowedDomains: ['api.github.com'],
      allowedActions: ['read_pr'],
      maxApiCalls: 10,
      timeoutSec: 20,
      memoryMb: 256,
    },
    code: stubCode(
      'return {"summary": "Refactors auth flow; reduces DB round-trips.", "risks": ["No new tests for the error path"]}',
    ),
  },
];

async function main() {
  console.log(`Seeding ${CREATORS.length} creators and ${SKILLS.length} skills...`);

  const creatorIds = new Map<string, string>();
  for (const c of CREATORS) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: { name: c.name, bio: c.bio, isAdmin: !!c.isAdmin },
      create: { email: c.email, name: c.name, bio: c.bio, isAdmin: !!c.isAdmin },
    });
    creatorIds.set(c.key, user.id);
  }

  for (const s of SKILLS) {
    const creatorId = creatorIds.get(s.creator);
    if (!creatorId) throw new Error(`Unknown creator key: ${s.creator}`);

    const isFree = s.pricingModel === PricingModel.FREE;

    const skill = await prisma.skill.upsert({
      where: { slug: s.slug },
      update: {
        description: s.description,
        tags: s.tags,
        pricingModel: s.pricingModel,
        price: s.price ?? 0,
        isFree,
        certification: s.certification,
        ratingAvg: s.ratingAvg,
        ratingCount: s.ratingCount,
        totalExecutions: s.totalExecutions,
        successRate: s.successRate,
        avgLatencyMs: s.avgLatencyMs,
        performanceScore: s.performanceScore,
        riskScore: s.riskScore,
        permissionsRequired: s.permissions as any,
      },
      create: {
        name: s.name,
        slug: s.slug,
        description: s.description,
        category: s.category,
        tags: s.tags,
        creatorId,
        pricingModel: s.pricingModel,
        price: s.price ?? 0,
        isFree,
        certification: s.certification,
        ratingAvg: s.ratingAvg,
        ratingCount: s.ratingCount,
        totalExecutions: s.totalExecutions,
        successRate: s.successRate,
        avgLatencyMs: s.avgLatencyMs,
        performanceScore: s.performanceScore,
        riskScore: s.riskScore,
        permissionsRequired: s.permissions as any,
        versions: {
          create: {
            version: 1,
            code: s.code,
            manifest: { entry: 'run' } as any,
          },
        },
      },
    });

    // Seed reviews (with a backing SUCCEEDED execution each, to satisfy the
    // anti-fake-review invariant).
    if (s.reviews?.length) {
      for (const r of s.reviews) {
        const reviewerId = creatorIds.get(r.reviewer);
        if (!reviewerId || reviewerId === creatorId) continue; // skip self-reviews
        const existing = await prisma.review.findFirst({
          where: { skillId: skill.id, userId: reviewerId },
        });
        if (existing) continue;
        const exec = await prisma.execution.create({
          data: {
            skillId: skill.id,
            userId: reviewerId,
            inputs: { __seed: true } as any,
            status: ExecutionStatus.SUCCEEDED,
            output: { ok: true } as any,
            durationMs: s.avgLatencyMs,
            finishedAt: new Date(),
          },
        });
        // Tiny hash-chained log entry so the execution detail page still verifies.
        const payload = JSON.stringify({ executionId: exec.id, seed: true });
        await prisma.log.create({
          data: {
            executionId: exec.id,
            level: 'info',
            message: 'seeded execution',
            hash: createHash('sha256').update(payload).digest('hex'),
          },
        });
        await prisma.review.create({
          data: {
            skillId: skill.id,
            userId: reviewerId,
            executionId: exec.id,
            rating: r.rating,
            body: r.body,
          },
        });
      }
    }
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
