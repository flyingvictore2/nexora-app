import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { WatchPartyService } from './watch-party.service';

@ApiTags('WatchParty')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('watch-party')
export class WatchPartyController {
  constructor(private service: WatchPartyService) {}

  @Post()
  create(
    @Body('contentId') contentId: string,
    @Body('episodeId') episodeId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.service.createParty(userId, contentId, episodeId);
  }

  @Post('join/:code')
  join(@Param('code') code: string, @CurrentUser('id') userId: string) {
    return this.service.joinParty(code, userId);
  }

  @Get('my')
  getMyParties(@CurrentUser('id') userId: string) {
    return this.service.getUserParties(userId);
  }

  @Get(':id')
  getParty(@Param('id') id: string) {
    return this.service.getParty(id);
  }

  @Delete(':id')
  close(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.closeParty(id, userId);
  }
}
