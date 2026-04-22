import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminGuard } from '../common/admin.guard';

@Controller('admin/kill-switch')
@UseGuards(AdminGuard)
export class KillSwitchController {
  constructor(private readonly prisma: PrismaService) {}

  @Post(':skillId')
  async toggle(@Param('skillId') skillId: string, @Body('on') on: boolean) {
    return this.prisma.skill.update({
      where: { id: skillId },
      data: {
        killSwitch: !!on,
        isDisabled: !!on ? true : false,
      },
    });
  }
}
