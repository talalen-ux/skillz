import { Controller, Get, Param } from '@nestjs/common';
import { CreatorsService } from './creators.service';

@Controller('creators')
export class CreatorsController {
  constructor(private readonly creators: CreatorsService) {}

  @Get(':id')
  get(@Param('id') id: string) {
    return this.creators.getProfile(id);
  }
}
