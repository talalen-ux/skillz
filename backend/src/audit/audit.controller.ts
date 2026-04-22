import { Controller, Get, Param, Post } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AuditService } from './audit.service';
import { AUDIT_QUEUE } from './audit.processor';

@Controller()
export class AuditController {
  constructor(
    private readonly audit: AuditService,
    @InjectQueue(AUDIT_QUEUE) private readonly queue: Queue,
  ) {}

  /** Synchronous full audit (small skills / dev). */
  @Post('skills/:id/audit')
  async run(@Param('id') id: string) {
    return this.audit.runFullPipeline(id);
  }

  /** Queue an async audit. */
  @Post('skills/:id/audit/async')
  async runAsync(@Param('id') id: string) {
    const job = await this.queue.add('full', { skillId: id, kind: 'full' });
    return { jobId: job.id };
  }

  @Post('skills/:id/audit/reassess')
  reassess(@Param('id') id: string) {
    return this.audit.reassess(id);
  }

  @Get('skills/:id/audit')
  list(@Param('id') id: string) {
    return this.audit.listForSkill(id);
  }
}
