import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async rate(userId: string, profileId: string, contentId: string, rating: number, review?: string) {
    const content = await this.prisma.content.findUnique({ where: { id: contentId } });
    if (!content) throw new NotFoundException('Content not found');

    const result = await this.prisma.rating.upsert({
      where: { profileId_contentId: { profileId, contentId } },
      create: { userId, profileId, contentId, rating, review },
      update: { rating, review },
    });

    // Update average rating
    const stats = await this.prisma.rating.aggregate({
      where: { contentId },
      _avg: { rating: true },
      _count: true,
    });

    await this.prisma.content.update({
      where: { id: contentId },
      data: { averageRating: stats._avg.rating || 0 },
    });

    return result;
  }

  async getForContent(contentId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [ratings, total] = await Promise.all([
      this.prisma.rating.findMany({
        where: { contentId },
        include: { profile: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.rating.count({ where: { contentId } }),
    ]);
    return { ratings, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getUserRating(profileId: string, contentId: string) {
    return this.prisma.rating.findUnique({
      where: { profileId_contentId: { profileId, contentId } },
    });
  }

  async delete(id: string, userId: string) {
    await this.prisma.rating.deleteMany({ where: { id, userId } });
    return { message: 'Rating removed' };
  }
}
