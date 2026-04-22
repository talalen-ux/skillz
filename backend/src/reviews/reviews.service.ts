import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SkillsService } from '../skills/skills.service';
import { CreateReviewDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly skills: SkillsService,
  ) {}

  async create(userId: string, dto: CreateReviewDto) {
    // Anti-fake guard: must own a real, non-failed execution of this skill.
    const exec = await this.prisma.execution.findUnique({ where: { id: dto.executionId } });
    if (!exec) throw new NotFoundException('Execution not found');
    if (exec.userId !== userId) throw new BadRequestException('Not your execution');
    if (exec.skillId !== dto.skillId) throw new BadRequestException('Execution/skill mismatch');
    if (exec.status !== 'SUCCEEDED') {
      throw new BadRequestException('Can only review successful executions');
    }

    try {
      const review = await this.prisma.review.create({
        data: {
          userId,
          skillId: dto.skillId,
          executionId: dto.executionId,
          rating: dto.rating,
          body: dto.body,
        },
      });
      await this.skills.refreshAggregates(dto.skillId);
      return review;
    } catch (err: any) {
      if (err.code === 'P2002') throw new ConflictException('Already reviewed this execution');
      throw err;
    }
  }

  async listForSkill(skillId: string) {
    return this.prisma.review.findMany({
      where: { skillId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true } } },
      take: 100,
    });
  }
}
