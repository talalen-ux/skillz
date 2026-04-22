import { Module } from '@nestjs/common';
import { ExecutionsController } from './executions.controller';
import { ExecutionsService } from './executions.service';
import { SandboxClient } from './sandbox.client';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [SkillsModule],
  controllers: [ExecutionsController],
  providers: [ExecutionsService, SandboxClient],
  exports: [ExecutionsService, SandboxClient],
})
export class ExecutionsModule {}
