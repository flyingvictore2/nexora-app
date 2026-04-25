import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async toggle(profileId: string, contentId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { profileId_contentId: { profileId, contentId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({ where: { id: existing.id } });
      return { added: false, message: 'Removed from favorites' };
    }

    await this.prisma.favorite.create({ data: { profileId, contentId } });
    return { added: true, message: 'Added to favorites' };
  }

  async getAll(profileId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { profileId },
        include: {
          content: {
            select: {
              id: true,
              title: true,
              posterUrl: true,
              bannerUrl: true,
              type: true,
              releaseYear: true,
              genres: true,
              averageRating: true,
              duration: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.favorite.count({ where: { profileId } }),
    ]);
    return { favorites, total, page, totalPages: Math.ceil(total / limit) };
  }

  async isFavorite(profileId: string, contentId: string) {
    const fav = await this.prisma.favorite.findUnique({
      where: { profileId_contentId: { profileId, contentId } },
    });
    return { isFavorite: !!fav };
  }
}
