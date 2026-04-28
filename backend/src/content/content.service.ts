import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto, ContentQueryDto } from './dto/content.dto';

@Injectable()
export class ContentService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  private readonly KIDS_SAFE_RATINGS = ['ALL', 'G', 'PG', 'TV-G', 'TV-Y', 'TV-Y7', '7+'];

  async findAll(query: ContentQueryDto) {
    const { page = 1, limit = 20, search, type, genre, language, sortBy = 'createdAt', sortOrder = 'desc', isFeatured, isTrending, isKids } = query;
    const skip = (page - 1) * limit;

    const where: any = { isPublished: true };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { cast: { has: search } },
        { director: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (type) where.type = type;
    if (genre) where.genres = { has: genre };
    if (language) where.language = language;
    if (isFeatured !== undefined) where.isFeatured = isFeatured;
    if (isTrending !== undefined) where.isTrending = isTrending;
    if (isKids) where.maturityRating = { in: this.KIDS_SAFE_RATINGS };

    // Only show scheduled content if release date has passed
    where.AND = [
      { OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }] },
    ];

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [content, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: +limit,
        orderBy,
        include: {
          subtitles: true,
          _count: { select: { seasons: true, watchHistory: true } },
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    return { content, total, page: +page, limit: +limit, totalPages: Math.ceil(total / +limit) };
  }

  async findOne(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        seasons: {
          orderBy: { number: 'asc' },
          include: {
            episodes: {
              orderBy: { number: 'asc' },
              include: { subtitles: true, videoSources: { orderBy: [{ isDefault: 'desc' }, { order: 'asc' }] } },
            },
          },
        },
        subtitles: true,
        videoSources: { orderBy: [{ isDefault: 'desc' }, { order: 'asc' }] },
        _count: { select: { ratings: true, favorites: true, watchHistory: true } },
      },
    });
    if (!content) throw new NotFoundException('Content not found');
    return content;
  }

  async getSignedUrl(contentId: string, userId: string, episodeId?: string) {
    const content = await this.prisma.content.findUnique({ where: { id: contentId } });
    if (!content) throw new NotFoundException('Content not found');

    // Check subscription plan
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    const planOrder = { FREE: 0, PREMIUM: 1, VIP: 2 };
    const userPlanLevel = planOrder[subscription?.plan?.planType || 'FREE'];
    const requiredLevel = planOrder[content.requiredPlan];

    if (userPlanLevel < requiredLevel) {
      throw new ForbiddenException('Upgrade your plan to access this content');
    }

    let videoUrl = content.videoUrl;
    let videoType: string = 'DIRECT';

    if (episodeId) {
      const episode = await this.prisma.episode.findUnique({
        where: { id: episodeId },
        include: { videoSources: { orderBy: [{ isDefault: 'desc' }, { order: 'asc' }], take: 1 } },
      });
      if (!episode) throw new NotFoundException('Episode not found');
      if (episode.videoSources?.length) {
        videoUrl = episode.videoSources[0].url;
        videoType = episode.videoSources[0].type;
      } else {
        videoUrl = episode.videoUrl;
      }
    } else {
      // For movies: prefer VideoSource over videoUrl
      try {
        const sources = await this.prisma.videoSource.findMany({
          where: { contentId },
          orderBy: [{ isDefault: 'desc' }, { order: 'asc' }],
          take: 1,
        });
        if (sources.length) {
          videoUrl = sources[0].url;
          videoType = sources[0].type;
        }
      } catch {
        // VideoSource table may not exist yet — fall back to content.videoUrl
      }
    }

    if (!videoUrl) throw new NotFoundException('No video source found for this content');

    // Generate signed URL (HMAC-based time-limited token)
    const secret = this.config.get('SIGNED_URL_SECRET', 'default_secret');
    const expiry = Date.now() + (this.config.get<number>('SIGNED_URL_EXPIRY', 3600) * 1000);
    const signature = crypto
      .createHmac('sha256', secret)
      .update(`${videoUrl}:${userId}:${expiry}`)
      .digest('hex');

    return {
      url: videoUrl,
      type: videoType,
      signedToken: signature,
      expiresAt: new Date(expiry),
    };
  }

  async getFeatured() {
    return this.prisma.content.findMany({
      where: { isFeatured: true, isPublished: true },
      take: 5,
      orderBy: { totalViews: 'desc' },
      include: { subtitles: true },
    });
  }

  async getTrending() {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.prisma.content.findMany({
      where: { isTrending: true, isPublished: true },
      take: 20,
      orderBy: { totalViews: 'desc' },
      include: {
        _count: { select: { watchHistory: true } },
      },
    });
  }

  async getByGenre(genre: string, limit = 20) {
    return this.prisma.content.findMany({
      where: { genres: { has: genre }, isPublished: true },
      take: +limit,
      orderBy: { totalViews: 'desc' },
    });
  }

  async getNewReleases() {
    return this.prisma.content.findMany({
      where: { isNew: true, isPublished: true },
      take: 20,
      orderBy: { releaseDate: 'desc' },
    });
  }

  async create(dto: CreateContentDto) {
    return this.prisma.content.create({ data: dto as any });
  }

  async update(id: string, dto: Partial<CreateContentDto>) {
    await this.findOne(id);
    return this.prisma.content.update({ where: { id }, data: dto as any });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.content.delete({ where: { id } });
    return { message: 'Content deleted' };
  }

  async incrementView(id: string) {
    await this.prisma.content.update({
      where: { id },
      data: { totalViews: { increment: 1 } },
    });
  }

  async getAllGenres() {
    const content = await this.prisma.content.findMany({
      where: { isPublished: true },
      select: { genres: true },
    });
    const genreSet = new Set<string>();
    content.forEach((c) => c.genres.forEach((g) => genreSet.add(g)));
    return Array.from(genreSet).sort();
  }

  async getContinueWatching(profileId: string) {
    return this.prisma.watchHistory.findMany({
      where: { profileId, completed: false, progress: { gt: 0 } },
      include: {
        content: { include: { _count: { select: { seasons: true } } } },
        episode: { include: { season: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
  }
}
