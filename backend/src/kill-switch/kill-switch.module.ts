import { Module } from '@nestjs/common';
import { KillSwitchController } from './kill-switch.controller';

@Module({ controllers: [KillSwitchController] })
export class KillSwitchModule {}
