import {
  Controller, Get, Post, Put, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { VideoSourcesService, CreateVideoSourceDto } from './video-sources.service';

@ApiTags('VideoSources')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('video-sources')
export class VideoSourcesController {
  constructor(private service: VideoSourcesService) {}

  @Get('episode/:episodeId')
  @Public()
  findByEpisode(@Param('episodeId') episodeId: string) {
    return this.service.findByEpisode(episodeId);
  }

  @Get('content/:contentId')
  @Public()
  findByContent(@Param('contentId') contentId: string) {
    return this.service.findByContent(contentId);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateVideoSourceDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateVideoSourceDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Delete('episode/:episodeId/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  deleteByEpisode(@Param('episodeId') episodeId: string) {
    return this.service.deleteByEpisode(episodeId);
  }

  @Delete('content/:contentId/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  deleteByContent(@Param('contentId') contentId: string) {
    return this.service.deleteByContent(contentId);
  }
}
