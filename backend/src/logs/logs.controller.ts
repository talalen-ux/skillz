import { Controller, Get, Param, Query } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller()
export class LogsController {
  constructor(private readonly logs: LogsService) {}

  @Get('executions/:id/logs')
  forExecution(@Param('id') id: string) {
    return this.logs.forExecution(id);
  }

  @Get('skills/:id/logs')
  forSkill(@Param('id') id: string, @Query('limit') limit?: string) {
    return this.logs.forSkill(id, limit ? Number(limit) : undefined);
  }
}
