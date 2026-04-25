import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { EpisodesService, CreateEpisodeDto } from './episodes.service';

@ApiTags('Episodes')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('episodes')
export class EpisodesController {
  constructor(private service: EpisodesService) {}

  @Get('season/:seasonId')
  @Public()
  findBySeason(@Param('seasonId') seasonId: string) {
    return this.service.findBySeason(seasonId);
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreateEpisodeDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: Partial<CreateEpisodeDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }

  @Post(':id/subtitles')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  addSubtitle(@Param('id') id: string, @Body() subtitle: { language: string; label: string; url: string }) {
    return this.service.addSubtitle(id, subtitle);
  }

  @Delete('subtitles/:subtitleId')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  removeSubtitle(@Param('subtitleId') subtitleId: string) {
    return this.service.removeSubtitle(subtitleId);
  }

  @Post(':id/view')
  @HttpCode(HttpStatus.OK)
  incrementView(@Param('id') id: string) {
    return this.service.incrementView(id);
  }
}
