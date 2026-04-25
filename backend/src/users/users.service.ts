import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where = search
      ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }] }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          isEmailVerified: true,
          isBlocked: true,
          lastLoginAt: true,
          createdAt: true,
          profiles: { select: { id: true, name: true, avatar: true } },
          subscription: { include: { plan: { select: { name: true, planType: true } } } },
          _count: { select: { watchHistory: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profiles: true,
        subscription: { include: { plan: true } },
        _count: { select: { watchHistory: true, ratings: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const { password, refreshToken, emailVerifyToken, resetPasswordToken, ...safe } = user;
    return safe;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        email: true,
        role: true,
        isEmailVerified: true,
        isBlocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  async block(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked: true, refreshToken: null },
      select: { id: true, email: true, isBlocked: true },
    });
  }

  async unblock(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { isBlocked: false },
      select: { id: true, email: true, isBlocked: true },
    });
  }

  async getActivity(userId: string) {
    const [watchHistory, ratings, favorites] = await Promise.all([
      this.prisma.watchHistory.findMany({
        where: { userId },
        include: { content: { select: { id: true, title: true, posterUrl: true, type: true } } },
        orderBy: { watchedAt: 'desc' },
        take: 20,
      }),
      this.prisma.rating.findMany({
        where: { userId },
        include: { content: { select: { id: true, title: true, posterUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.favorite.findMany({
        where: { profile: { userId } },
        include: { content: { select: { id: true, title: true, posterUrl: true, type: true } } },
        take: 10,
      }),
    ]);
    return { watchHistory, ratings, favorites };
  }

  async getStats() {
    const [total, active, blocked, verified, newThisMonth] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isBlocked: false } }),
      this.prisma.user.count({ where: { isBlocked: true } }),
      this.prisma.user.count({ where: { isEmailVerified: true } }),
      this.prisma.user.count({
        where: {
          createdAt: { gte: new Date(new Date().setDate(1)) },
        },
      }),
    ]);
    return { total, active, blocked, verified, newThisMonth };
  }
}
