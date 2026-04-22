import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { SkillsModule } from './skills/skills.module';
import { ExecutionsModule } from './executions/executions.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CreatorsModule } from './creators/creators.module';
import { AuditModule } from './audit/audit.module';
import { LogsModule } from './logs/logs.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { KillSwitchModule } from './kill-switch/kill-switch.module';
import { CollaborationModule } from './collaboration/collaboration.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    PrismaModule,
    SkillsModule,
    ExecutionsModule,
    ReviewsModule,
    CreatorsModule,
    AuditModule,
    LogsModule,
    MonitoringModule,
    KillSwitchModule,
    CollaborationModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
