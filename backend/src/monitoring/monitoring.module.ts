import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { MonitoringService } from './monitoring.service';
import { AUDIT_QUEUE } from '../audit/audit.processor';

@Module({
  imports: [BullModule.registerQueue({ name: AUDIT_QUEUE })],
  providers: [MonitoringService],
})
export class MonitoringModule {}
