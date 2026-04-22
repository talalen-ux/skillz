import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CreatorsService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        createdSkills: {
          orderBy: { ratingAvg: 'desc' },
          take: 50,
        },
      },
    });
    if (!user) throw new NotFoundException('Creator not found');

    const skillIds = user.createdSkills.map((s) => s.id);
    const [executionsCount, audits, ratingAgg] = await this.prisma.$transaction([
      this.prisma.execution.count({ where: { skillId: { in: skillIds } } }),
      this.prisma.auditResult.findMany({
        where: { skillId: { in: skillIds } },
        select: { passed: true },
      }),
      this.prisma.review.aggregate({
        where: { skillId: { in: skillIds } },
        _avg: { rating: true },
        _count: { _all: true },
      }),
    ]);
    const auditPassRate =
      audits.length > 0 ? audits.filter((a) => a.passed).length / audits.length : 0;

    const revenue = user.createdSkills.reduce((acc, s) => {
      const price = Number(s.price as unknown as Prisma.Decimal);
      return acc + price * s.totalExecutions;
    }, 0);

    return {
      id: user.id,
      name: user.name,
      bio: user.bio,
      createdAt: user.createdAt,
      stats: {
        totalSkills: user.createdSkills.length,
        totalExecutions: executionsCount,
        avgRating: ratingAgg._avg.rating ?? 0,
        ratingCount: ratingAgg._count._all,
        auditPassRate,
        estimatedRevenue: Math.round(revenue * 100) / 100,
      },
      skills: user.createdSkills,
    };
  }
}
