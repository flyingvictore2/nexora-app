import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { ContentService } from './content.service';
import { CreateContentDto, ContentQueryDto } from './dto/content.dto';

@ApiTags('Content')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('content')
export class ContentController {
  constructor(private service: ContentService) {}

  @Get()
  @Public()
  findAll(@Query() query: ContentQueryDto) {
    return this.service.findAll(query);
  }

  @Get('featured')
  @Public()
  getFeatured() {
    return this.service.getFeatured();
  }

  @Get('trending')
  @Public()
  getTrending() {
    return this.service.getTrending();
  }

  @Get('new-releases')
  @Public()
  getNewReleases() {
    return this.service.getNewReleases();
  }

  @Get('genres')
  @Public()
  getAllGenres() {
    return this.service.getAllGenres();
  }

  @Get('genre/:genre')
  @Public()
  getByGenre(@Param('genre') genre: string, @Query('limit') limit?: number) {
    return this.service.getByGenre(genre, limit);
  }

  @Get('continue-watching')
  continueWatching(@Headers('x-profile-id') profileId: string) {
    return this.service.getContinueWatching(profileId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get(':id/signed-url')
  getSignedUrl(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Query('episodeId') episodeId?: string,
  ) {
    return this.service.getSignedUrl(id, userId, episodeId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateContentDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateContentDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  incrementView(@Param('id') id: string) {
    return this.service.incrementView(id);
  }
}
