import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollaborationService {
  constructor(private readonly prisma: PrismaService) {}

  async addContributor(skillId: string, ownerId: string, userId: string, percentage: number, description?: string) {
    const skill = await this.prisma.skill.findUnique({ where: { id: skillId } });
    if (!skill) throw new NotFoundException();
    if (skill.creatorId !== ownerId) throw new ForbiddenException('Only owner can add contributors');
    const existing = await this.prisma.contribution.aggregate({
      where: { skillId },
      _sum: { percentage: true },
    });
    const current = existing._sum.percentage ?? 0;
    if (current + percentage > 100) {
      throw new ForbiddenException(`Total contribution would exceed 100% (currently ${current}%)`);
    }
    return this.prisma.contribution.upsert({
      where: { skillId_userId: { skillId, userId } },
      create: { skillId, userId, percentage, description },
      update: { percentage, description },
    });
  }

  async list(skillId: string) {
    return this.prisma.contribution.findMany({
      where: { skillId },
      include: { user: { select: { id: true, name: true } } },
    });
  }
}
