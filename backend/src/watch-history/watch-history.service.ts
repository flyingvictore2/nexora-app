import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export class UpdateProgressDto {
  contentId: string;
  profileId: string;
  episodeId?: string;
  progress: number;
  duration: number;
}

@Injectable()
export class WatchHistoryService {
  constructor(private prisma: PrismaService) {}

  async updateProgress(userId: string, dto: UpdateProgressDto) {
    const completed = dto.duration > 0 && dto.progress / dto.duration >= 0.9;
    const episodeId = dto.episodeId ?? null;

    return this.prisma.watchHistory.upsert({
      where: {
        profileId_contentId_episodeId: {
          profileId: dto.profileId,
          contentId: dto.contentId,
          episodeId: episodeId as string,
        },
      },
      create: {
        userId,
        profileId: dto.profileId,
        contentId: dto.contentId,
        episodeId,
        progress: dto.progress,
        duration: dto.duration,
        completed,
        watchedAt: new Date(),
      },
      update: { progress: dto.progress, duration: dto.duration, completed, watchedAt: new Date() },
    });
  }

  async getHistory(profileId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [history, total] = await Promise.all([
      this.prisma.watchHistory.findMany({
        where: { profileId },
        include: {
          content: { select: { id: true, title: true, posterUrl: true, type: true, duration: true } },
          episode: { select: { id: true, number: true, title: true, season: { select: { number: true } } } },
        },
        orderBy: { watchedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.watchHistory.count({ where: { profileId } }),
    ]);
    return { history, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getContinueWatching(profileId: string) {
    return this.prisma.watchHistory.findMany({
      where: { profileId, completed: false, progress: { gt: 0 } },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            posterUrl: true,
            bannerUrl: true,
            type: true,
            duration: true,
            _count: { select: { seasons: true } },
          },
        },
        episode: {
          select: {
            id: true,
            number: true,
            title: true,
            thumbnailUrl: true,
            duration: true,
            season: { select: { number: true, contentId: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }

  async getProgress(profileId: string, contentId: string, episodeId?: string) {
    return this.prisma.watchHistory.findFirst({
      where: {
        profileId,
        contentId,
        episodeId: episodeId ?? null,
      },
    });
  }

  async deleteHistoryItem(id: string, userId: string) {
    await this.prisma.watchHistory.deleteMany({ where: { id, userId } });
    return { message: 'Removed from history' };
  }

  async clearHistory(profileId: string, userId: string) {
    await this.prisma.watchHistory.deleteMany({ where: { profileId, userId } });
    return { message: 'History cleared' };
  }
}
