import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class CreateSeasonDto {
  contentId: string;
  number: number;
  title?: string;
  description?: string;
  posterUrl?: string;
  releaseYear?: number;
}

@Injectable()
export class SeasonsService {
  constructor(private prisma: PrismaService) {}

  async findByContent(contentId: string) {
    return this.prisma.season.findMany({
      where: { contentId },
      orderBy: { number: 'asc' },
      include: {
        episodes: {
          orderBy: { number: 'asc' },
          include: { subtitles: true },
        },
        _count: { select: { episodes: true } },
      },
    });
  }

  async findOne(id: string) {
    const season = await this.prisma.season.findUnique({
      where: { id },
      include: {
        episodes: {
          orderBy: { number: 'asc' },
          include: { subtitles: true },
        },
      },
    });
    if (!season) throw new NotFoundException('Season not found');
    return season;
  }

  async create(dto: CreateSeasonDto) {
    const exists = await this.prisma.season.findFirst({
      where: { contentId: dto.contentId, number: dto.number },
    });
    if (exists) throw new ConflictException(`Season ${dto.number} already exists`);

    return this.prisma.season.create({ data: dto });
  }

  async update(id: string, dto: Partial<CreateSeasonDto>) {
    await this.findOne(id);
    return this.prisma.season.update({ where: { id }, data: dto });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.season.delete({ where: { id } });
    return { message: 'Season deleted' };
  }
}
