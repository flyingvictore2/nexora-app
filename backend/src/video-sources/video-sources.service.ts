import { Injectable, NotFoundException } from '@nestjs/common';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { PrismaService } from '../prisma/prisma.service';
import { VideoSourceType } from '@prisma/client';

export class CreateVideoSourceDto {
  @IsOptional() @IsString() episodeId?: string;
  @IsOptional() @IsString() contentId?: string;
  @IsString() serverName: string;
  @IsString() url: string;
  @IsOptional() @IsString() quality?: string;
  @IsOptional() @IsEnum(VideoSourceType) type?: VideoSourceType;
  @IsOptional() @IsNumber() @Type(() => Number) order?: number;
  @IsOptional() @IsBoolean() isDefault?: boolean;
}

@Injectable()
export class VideoSourcesService {
  constructor(private prisma: PrismaService) {}

  async findByEpisode(episodeId: string) {
    return this.prisma.videoSource.findMany({
      where: { episodeId },
      orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
    });
  }

  async findByContent(contentId: string) {
    return this.prisma.videoSource.findMany({
      where: { contentId },
      orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
    });
  }

  async create(dto: CreateVideoSourceDto) {
    return this.prisma.videoSource.create({ data: dto as any });
  }

  async update(id: string, dto: Partial<CreateVideoSourceDto>) {
    const source = await this.prisma.videoSource.findUnique({ where: { id } });
    if (!source) throw new NotFoundException('VideoSource not found');
    return this.prisma.videoSource.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    const source = await this.prisma.videoSource.findUnique({ where: { id } });
    if (!source) throw new NotFoundException('VideoSource not found');
    await this.prisma.videoSource.delete({ where: { id } });
    return { message: 'VideoSource deleted' };
  }

  async deleteByEpisode(episodeId: string) {
    await this.prisma.videoSource.deleteMany({ where: { episodeId } });
  }

  async deleteByContent(contentId: string) {
    await this.prisma.videoSource.deleteMany({ where: { contentId } });
  }
}
