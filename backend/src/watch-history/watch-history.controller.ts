import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WatchHistoryService, UpdateProgressDto } from './watch-history.service';

@ApiTags('Watch History')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('watch-history')
export class WatchHistoryController {
  constructor(private service: WatchHistoryService) {}

  @Post('progress')
  @HttpCode(HttpStatus.OK)
  updateProgress(@CurrentUser('id') userId: string, @Body() dto: UpdateProgressDto) {
    return this.service.updateProgress(userId, dto);
  }

  @Get()
  getHistory(
    @Headers('x-profile-id') profileId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.service.getHistory(profileId, +page, +limit);
  }

  @Get('continue-watching')
  getContinueWatching(@Headers('x-profile-id') profileId: string) {
    return this.service.getContinueWatching(profileId);
  }

  @Get('progress/:contentId')
  getProgress(
    @Headers('x-profile-id') profileId: string,
    @Param('contentId') contentId: string,
    @Query('episodeId') episodeId?: string,
  ) {
    return this.service.getProgress(profileId, contentId, episodeId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteItem(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.deleteHistoryItem(id, userId);
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  clearHistory(@Headers('x-profile-id') profileId: string, @CurrentUser('id') userId: string) {
    return this.service.clearHistory(profileId, userId);
  }
}
