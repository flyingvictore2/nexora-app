import { Controller, Get, Post, Param, Query, UseGuards, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@ApiTags('Favorites')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private service: FavoritesService) {}

  @Get()
  getAll(@Headers('x-profile-id') profileId: string, @Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.getAll(profileId, +page, +limit);
  }

  @Post(':contentId')
  @HttpCode(HttpStatus.OK)
  toggle(@Headers('x-profile-id') profileId: string, @Param('contentId') contentId: string) {
    return this.service.toggle(profileId, contentId);
  }

  @Get(':contentId/check')
  check(@Headers('x-profile-id') profileId: string, @Param('contentId') contentId: string) {
    return this.service.isFavorite(profileId, contentId);
  }
}
