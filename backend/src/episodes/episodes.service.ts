import { Injectable, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';

export class CreateEpisodeDto {
  @IsString() seasonId: string;
  @IsNumber() @Type(() => Number) number: number;
  @IsString() title: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() thumbnailUrl?: string;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsNumber() @Type(() => Number) duration?: number;
  @IsOptional() @IsDateString() releaseDate?: string;
  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsNumber() @Type(() => Number) introStart?: number;
  @IsOptional() @IsNumber() @Type(() => Number) introEnd?: number;
}

@Injectable()
export class EpisodesService {
  constructor(private prisma: PrismaService) {}

  async findBySeason(seasonId: string) {
    return this.prisma.episode.findMany({
      where: { seasonId },
      orderBy: { number: 'asc' },
      include: { subtitles: true, videoSources: { orderBy: [{ isDefault: 'desc' }, { order: 'asc' }] } },
    });
  }

  async findOne(id: string) {
    const ep = await this.prisma.episode.findUnique({
      where: { id },
      include: {
        subtitles: true,
        videoSources: { orderBy: [{ isDefault: 'desc' }, { order: 'asc' }] },
        season: { include: { content: { select: { id: true, title: true, type: true } } } },
      },
    });
    if (!ep) throw new NotFoundException('Episode not found');
    return ep;
  }

  async create(dto: CreateEpisodeDto) {
    return this.prisma.episode.create({ data: dto as any });
  }

  async update(id: string, dto: Partial<CreateEpisodeDto>) {
    await this.findOne(id);
    return this.prisma.episode.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.episode.delete({ where: { id } });
    return { message: 'Episode deleted' };
  }

  async addSubtitle(episodeId: string, subtitle: { language: string; label: string; url: string }) {
    await this.findOne(episodeId);
    return this.prisma.subtitle.create({ data: { episodeId, ...subtitle } });
  }

  async removeSubtitle(subtitleId: string) {
    return this.prisma.subtitle.delete({ where: { id: subtitleId } });
  }

  async incrementView(id: string) {
    await this.prisma.episode.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }
}
