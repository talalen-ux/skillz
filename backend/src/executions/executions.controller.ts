import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ExecutionsService } from './executions.service';
import { CurrentUser } from '../common/current-user.decorator';
import { ExecuteSkillDto } from './dto';

@Controller()
export class ExecutionsController {
  constructor(private readonly executions: ExecutionsService) {}

  @Post('skills/:id/execute')
  execute(
    @CurrentUser() userId: string | undefined,
    @Param('id') skillId: string,
    @Body() dto: ExecuteSkillDto,
  ) {
    return this.executions.execute(skillId, userId, dto.inputs);
  }

  @Get('executions/:id')
  get(@Param('id') id: string) {
    return this.executions.get(id);
  }

  @Get('executions')
  list(@Query('skillId') skillId?: string, @Query('userId') userId?: string) {
    return this.executions.list(skillId, userId);
  }
}
