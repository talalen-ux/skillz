import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { AuditService } from './audit.service';

export const AUDIT_QUEUE = 'audit';

@Processor(AUDIT_QUEUE)
export class AuditProcessor extends WorkerHost {
  private readonly logger = new Logger(AuditProcessor.name);

  constructor(private readonly audit: AuditService) {
    super();
  }

  async process(job: Job<{ skillId: string; kind: 'full' | 'reassess' }>) {
    const { skillId, kind } = job.data;
    this.logger.log(`Audit ${kind} for ${skillId}`);
    if (kind === 'reassess') return this.audit.reassess(skillId);
    return this.audit.runFullPipeline(skillId);
  }
}
