import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getForProfile(profileId: string) {
    // Get user's watch history genres
    const history = await this.prisma.watchHistory.findMany({
      where: { profileId },
      include: { content: { select: { genres: true, type: true } } },
      orderBy: { watchedAt: 'desc' },
      take: 20,
    });

    const watchedIds = history.map((h) => h.contentId);

    // Count genre frequency
    const genreCounts = new Map<string, number>();
    history.forEach((h) => {
      h.content?.genres?.forEach((g) => {
        genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
      });
    });

    const topGenres = Array.from(genreCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([g]) => g);

    // Get favorites
    const favorites = await this.prisma.favorite.findMany({
      where: { profileId },
      include: { content: { select: { genres: true } } },
    });
    const favoriteGenres = favorites.flatMap((f) => f.content?.genres || []);

    const allGenres = [...new Set([...topGenres, ...favoriteGenres])].slice(0, 5);

    // If no history, return trending
    if (allGenres.length === 0) {
      return this.prisma.content.findMany({
        where: { isPublished: true, isTrending: true },
        take: 20,
        orderBy: { totalViews: 'desc' },
      });
    }

    // Recommend by genres not yet watched
    const recommended = await this.prisma.content.findMany({
      where: {
        isPublished: true,
        id: { notIn: watchedIds },
        genres: { hasSome: allGenres },
      },
      take: 30,
      orderBy: [{ averageRating: 'desc' }, { totalViews: 'desc' }],
    });

    // Shuffle for variety
    return recommended.sort(() => Math.random() - 0.5).slice(0, 20);
  }

  async getSimilar(contentId: string) {
    const content = await this.prisma.content.findUnique({
      where: { id: contentId },
      select: { genres: true, type: true, director: true },
    });
    if (!content) return [];

    return this.prisma.content.findMany({
      where: {
        isPublished: true,
        id: { not: contentId },
        type: content.type,
        OR: [
          { genres: { hasSome: content.genres } },
          { director: content.director || undefined },
        ],
      },
      take: 12,
      orderBy: { averageRating: 'desc' },
    });
  }

  async getTopRated(type?: string) {
    return this.prisma.content.findMany({
      where: {
        isPublished: true,
        averageRating: { gt: 3 },
        ...(type ? { type: type as any } : {}),
      },
      take: 20,
      orderBy: { averageRating: 'desc' },
    });
  }
}
