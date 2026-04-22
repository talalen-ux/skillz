import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateSkillDto, ListSkillsQuery, PublishVersionDto, UpdateSkillDto } from './dto';
import { AdminGuard } from '../common/admin.guard';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skills: SkillsService) {}

  @Post()
  create(@CurrentUser() userId: string | undefined, @Body() dto: CreateSkillDto) {
    if (!userId) throw new UnauthorizedException('x-user-id required');
    return this.skills.create(userId, dto);
  }

  @Get()
  list(@Query() query: ListSkillsQuery) {
    return this.skills.list(query);
  }

  @Get('slug/:slug')
  bySlug(@Param('slug') slug: string) {
    return this.skills.getBySlug(slug);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.skills.get(id);
  }

  @Patch(':id')
  update(
    @CurrentUser() userId: string | undefined,
    @Param('id') id: string,
    @Body() dto: UpdateSkillDto,
  ) {
    if (!userId) throw new UnauthorizedException();
    return this.skills.update(userId, id, dto);
  }

  @Post(':id/versions')
  publishVersion(
    @CurrentUser() userId: string | undefined,
    @Param('id') id: string,
    @Body() dto: PublishVersionDto,
  ) {
    if (!userId) throw new UnauthorizedException();
    return this.skills.publishVersion(userId, id, dto);
  }

  @Post(':id/fork')
  fork(
    @CurrentUser() userId: string | undefined,
    @Param('id') id: string,
    @Body('name') name?: string,
  ) {
    if (!userId) throw new UnauthorizedException();
    return this.skills.fork(userId, id, name);
  }

  @Post(':id/kill-switch')
  @UseGuards(AdminGuard)
  killSwitch(@Param('id') id: string, @Body('on') on: boolean) {
    return this.skills.setKillSwitch(id, !!on);
  }
}
