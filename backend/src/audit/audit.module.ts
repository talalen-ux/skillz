import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { AuditService } from './audit.service';
import { AuditController } from './audit.controller';
import { AuditProcessor, AUDIT_QUEUE } from './audit.processor';
import { ExecutionsModule } from '../executions/executions.module';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [
    BullModule.registerQueue({ name: AUDIT_QUEUE }),
    ExecutionsModule,
    SkillsModule,
  ],
  controllers: [AuditController],
  providers: [AuditService, AuditProcessor],
  exports: [AuditService],
})
export class AuditModule {}
