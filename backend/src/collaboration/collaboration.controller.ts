import { Body, Controller, Get, Param, Post, UnauthorizedException } from '@nestjs/common';
import { CollaborationService } from './collaboration.service';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('skills/:id/contributors')
export class CollaborationController {
  constructor(private readonly collab: CollaborationService) {}

  @Get()
  list(@Param('id') id: string) {
    return this.collab.list(id);
  }

  @Post()
  add(
    @CurrentUser() ownerId: string | undefined,
    @Param('id') id: string,
    @Body() body: { userId: string; percentage: number; description?: string },
  ) {
    if (!ownerId) throw new UnauthorizedException();
    return this.collab.addContributor(id, ownerId, body.userId, body.percentage, body.description);
  }
}
