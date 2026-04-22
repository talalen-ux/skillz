import { Body, Controller, Get, Param, Post, UnauthorizedException } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CurrentUser } from '../common/current-user.decorator';
import { CreateReviewDto } from './dto';

@Controller()
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @Post('reviews')
  create(@CurrentUser() userId: string | undefined, @Body() dto: CreateReviewDto) {
    if (!userId) throw new UnauthorizedException();
    return this.reviews.create(userId, dto);
  }

  @Get('skills/:id/reviews')
  forSkill(@Param('id') id: string) {
    return this.reviews.listForSkill(id);
  }
}
