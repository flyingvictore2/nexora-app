import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { FriendsService } from './friends.service';

@ApiTags('Friends')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('friends')
export class FriendsController {
  constructor(private service: FriendsService) {}

  @Get('search')
  search(@Query('q') q: string, @CurrentUser('id') userId: string) {
    return this.service.searchUsers(q ?? '', userId);
  }

  @Get()
  getFriends(@CurrentUser('id') userId: string) {
    return this.service.getFriends(userId);
  }

  @Get('requests/pending')
  getPending(@CurrentUser('id') userId: string) {
    return this.service.getPendingRequests(userId);
  }

  @Get('requests/sent')
  getSent(@CurrentUser('id') userId: string) {
    return this.service.getSentRequests(userId);
  }

  @Get('status/:userId')
  getStatus(@Param('userId') otherId: string, @CurrentUser('id') userId: string) {
    return this.service.getFriendshipStatus(userId, otherId);
  }

  @Post('request/:userId')
  sendRequest(@Param('userId') receiverId: string, @CurrentUser('id') userId: string) {
    return this.service.sendRequest(userId, receiverId);
  }

  @Post('request/:id/accept')
  accept(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.respondRequest(id, userId, true);
  }

  @Post('request/:id/reject')
  reject(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.respondRequest(id, userId, false);
  }

  @Delete(':friendId')
  remove(@Param('friendId') friendId: string, @CurrentUser('id') userId: string) {
    return this.service.removeFriend(userId, friendId);
  }
}
