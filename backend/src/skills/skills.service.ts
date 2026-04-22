import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, PricingModel } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSkillDto, ListSkillsQuery, PublishVersionDto, UpdateSkillDto } from './dto';

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

@Injectable()
export class SkillsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(creatorId: string, dto: CreateSkillDto) {
    const baseSlug = slugify(dto.name) || 'skill';
    let slug = baseSlug;
    let n = 1;
    // Ensure unique slug.
    while (await this.prisma.skill.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++n}`;
    }
    const isFree = dto.pricingModel === PricingModel.FREE || (dto.price ?? 0) === 0;

    return this.prisma.skill.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description,
        category: dto.category,
        tags: dto.tags ?? [],
        creatorId,
        pricingModel: dto.pricingModel,
        price: new Prisma.Decimal(dto.price ?? 0),
        isFree,
        permissionsRequired: dto.permissionsRequired as any,
        versions: {
          create: {
            version: 1,
            code: dto.code,
            manifest: (dto.manifest ?? {}) as any,
          },
        },
      },
      include: { versions: true, creator: { select: { id: true, name: true } } },
    });
  }

  async list(query: ListSkillsQuery) {
    const page = Number(query.page ?? 1);
    const limit = Math.min(Number(query.limit ?? 24), 100);
    const where: Prisma.SkillWhereInput = {
      isDisabled: false,
      ...(query.category ? { category: query.category } : {}),
      ...(query.certification ? { certification: query.certification as any } : {}),
      ...(query.pricingModel ? { pricingModel: query.pricingModel as any } : {}),
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' } },
              { description: { contains: query.q, mode: 'insensitive' } },
              { tags: { has: query.q.toLowerCase() } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.SkillOrderByWithRelationInput =
      query.sort === 'recent'
        ? { createdAt: 'desc' }
        : query.sort === 'popular'
        ? { totalExecutions: 'desc' }
        : query.sort === 'price'
        ? { price: 'asc' }
        : { ratingAvg: 'desc' };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.skill.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: { creator: { select: { id: true, name: true } } },
      }),
      this.prisma.skill.count({ where }),
    ]);
    return { items, total, page, limit };
  }

  async get(id: string) {
    const skill = await this.prisma.skill.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, bio: true } },
        versions: { orderBy: { version: 'desc' } },
        auditResults: { orderBy: { createdAt: 'desc' }, take: 10 },
        contributions: { include: { user: { select: { id: true, name: true } } } },
      },
    });
    if (!skill) throw new NotFoundException('Skill not found');
    return skill;
  }

  async getBySlug(slug: string) {
    const skill = await this.prisma.skill.findUnique({ where: { slug } });
    if (!skill) throw new NotFoundException('Skill not found');
    return this.get(skill.id);
  }

  async update(creatorId: string, id: string, dto: UpdateSkillDto) {
    const existing = await this.prisma.skill.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Skill not found');
    if (existing.creatorId !== creatorId) throw new ForbiddenException('Not your skill');
    return this.prisma.skill.update({ where: { id }, data: dto });
  }

  async publishVersion(creatorId: string, id: string, dto: PublishVersionDto) {
    const skill = await this.prisma.skill.findUnique({ where: { id } });
    if (!skill) throw new NotFoundException('Skill not found');
    if (skill.creatorId !== creatorId) throw new ForbiddenException('Not your skill');

    const nextVersion = skill.currentVersion + 1;
    const [, updated] = await this.prisma.$transaction([
      this.prisma.skillVersion.create({
        data: {
          skillId: id,
          version: nextVersion,
          code: dto.code,
          manifest: (dto.manifest ?? {}) as any,
          changelog: dto.changelog,
        },
      }),
      this.prisma.skill.update({
        where: { id },
        data: {
          currentVersion: nextVersion,
          // Re-publishing resets certification — must be re-audited.
          certification: 'UNVERIFIED',
          ...(dto.permissionsRequired
            ? { permissionsRequired: dto.permissionsRequired as any }
            : {}),
        },
      }),
    ]);
    return updated;
  }

  async getCurrentVersion(skillId: string) {
    const skill = await this.prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) throw new NotFoundException('Skill not found');
    return this.prisma.skillVersion.findUnique({
      where: { skillId_version: { skillId, version: skill.currentVersion } },
    });
  }

  async fork(userId: string, sourceId: string, name?: string) {
    const source = await this.prisma.skill.findUnique({ where: { id: sourceId } });
    if (!source) throw new NotFoundException('Source skill not found');
    const head = await this.getCurrentVersion(sourceId);
    const newName = name ?? `${source.name} (fork)`;
    const baseSlug = slugify(newName);
    let slug = baseSlug;
    let n = 1;
    while (await this.prisma.skill.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++n}`;
    }

    return this.prisma.skill.create({
      data: {
        name: newName,
        slug,
        description: source.description,
        category: source.category,
        tags: source.tags,
        creatorId: userId,
        pricingModel: 'FREE',
        price: new Prisma.Decimal(0),
        isFree: true,
        permissionsRequired: source.permissionsRequired as any,
        forkedFromId: source.id,
        versions: {
          create: {
            version: 1,
            code: head?.code ?? '',
            manifest: (head?.manifest ?? {}) as any,
            changelog: `Forked from ${source.slug}@v${source.currentVersion}`,
          },
        },
      },
      include: { versions: true },
    });
  }

  async setKillSwitch(id: string, on: boolean) {
    return this.prisma.skill.update({
      where: { id },
      data: { killSwitch: on, isDisabled: on ? true : undefined },
    });
  }

  /** Rolling update of perf/rating aggregates after each execution or review. */
  async refreshAggregates(skillId: string) {
    const [execStats, reviewStats] = await this.prisma.$transaction([
      this.prisma.execution.aggregate({
        where: { skillId, status: { in: ['SUCCEEDED', 'FAILED'] } },
        _count: { _all: true },
        _avg: { durationMs: true },
      }),
      this.prisma.review.aggregate({
        where: { skillId },
        _count: { _all: true },
        _avg: { rating: true },
      }),
    ]);
    const total = execStats._count._all;
    const succeeded = await this.prisma.execution.count({
      where: { skillId, status: 'SUCCEEDED' },
    });
    const successRate = total > 0 ? succeeded / total : 0;
    return this.prisma.skill.update({
      where: { id: skillId },
      data: {
        totalExecutions: total,
        successRate,
        avgLatencyMs: Math.round(execStats._avg.durationMs ?? 0),
        ratingAvg: reviewStats._avg.rating ?? 0,
        ratingCount: reviewStats._count._all,
        performanceScore: Math.round(
          (successRate * 60 + Math.min(40, ((reviewStats._avg.rating ?? 0) / 5) * 40)) * 10,
        ) / 10,
      },
    });
  }
}
