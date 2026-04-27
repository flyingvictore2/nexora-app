import { Controller, Get, Post, Patch, Delete, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ListsService } from './lists.service';

@ApiTags('Lists')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  constructor(private service: ListsService) {}

  @Get()
  getLists(@Headers('x-profile-id') profileId: string) {
    return this.service.getLists(profileId);
  }

  @Post()
  createList(
    @Headers('x-profile-id') profileId: string,
    @Body('name') name: string,
    @Body('emoji') emoji?: string,
  ) {
    return this.service.createList(profileId, name, emoji);
  }

  // Must be before /:id so "content" is not treated as an id
  @Get('content/:contentId')
  getContentLists(
    @Param('contentId') contentId: string,
    @Headers('x-profile-id') profileId: string,
  ) {
    return this.service.getContentLists(contentId, profileId);
  }

  @Get(':id')
  getList(@Param('id') id: string, @Headers('x-profile-id') profileId: string) {
    return this.service.getList(id, profileId);
  }

  @Patch(':id')
  updateList(
    @Param('id') id: string,
    @Headers('x-profile-id') profileId: string,
    @Body() dto: { name?: string; emoji?: string },
  ) {
    return this.service.updateList(id, profileId, dto);
  }

  @Delete(':id')
  deleteList(@Param('id') id: string, @Headers('x-profile-id') profileId: string) {
    return this.service.deleteList(id, profileId);
  }

  @Post(':id/items/:contentId')
  addItem(
    @Param('id') listId: string,
    @Param('contentId') contentId: string,
    @Headers('x-profile-id') profileId: string,
  ) {
    return this.service.addItem(listId, contentId, profileId);
  }

  @Delete(':id/items/:contentId')
  removeItem(
    @Param('id') listId: string,
    @Param('contentId') contentId: string,
    @Headers('x-profile-id') profileId: string,
  ) {
    return this.service.removeItem(listId, contentId, profileId);
  }
}
