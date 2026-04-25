import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { RatingsService } from './ratings.service';

@ApiTags('Ratings')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('ratings')
export class RatingsController {
  constructor(private service: RatingsService) {}

  @Post()
  rate(
    @CurrentUser('id') userId: string,
    @Headers('x-profile-id') profileId: string,
    @Body('contentId') contentId: string,
    @Body('rating') rating: number,
    @Body('review') review?: string,
  ) {
    return this.service.rate(userId, profileId, contentId, rating, review);
  }

  @Get('content/:contentId')
  @Public()
  getForContent(
    @Param('contentId') contentId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.getForContent(contentId, +page, +limit);
  }

  @Get('my/:contentId')
  getMyRating(
    @Headers('x-profile-id') profileId: string,
    @Param('contentId') contentId: string,
  ) {
    return this.service.getUserRating(profileId, contentId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.delete(id, userId);
  }
}
