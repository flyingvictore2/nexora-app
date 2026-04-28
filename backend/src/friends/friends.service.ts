import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FriendStatus } from '@prisma/client';

const USER_SELECT = { id: true, email: true, name: true, avatar: true };

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async searchUsers(query: string, currentUserId: string) {
    return this.prisma.user.findMany({
      where: {
        AND: [
          { id: { not: currentUserId } },
          { isBlocked: false },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { email: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: USER_SELECT,
      take: 10,
    });
  }

  async sendRequest(senderId: string, receiverId: string) {
    if (senderId === receiverId) throw new BadRequestException('No puedes añadirte a ti mismo');

    const existing = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId, receiverId },
          { senderId: receiverId, receiverId: senderId },
        ],
      },
    });

    if (existing) {
      if (existing.status === FriendStatus.ACCEPTED) throw new BadRequestException('Ya sois amigos');
      if (existing.status === FriendStatus.PENDING) throw new BadRequestException('Solicitud ya enviada');
      // If rejected, allow re-sending
      return this.prisma.friendship.update({
        where: { id: existing.id },
        data: { status: FriendStatus.PENDING, senderId, receiverId },
      });
    }

    return this.prisma.friendship.create({ data: { senderId, receiverId } });
  }

  async respondRequest(friendshipId: string, userId: string, accept: boolean) {
    const req = await this.prisma.friendship.findUnique({ where: { id: friendshipId } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');
    if (req.receiverId !== userId) throw new BadRequestException('No autorizado');

    return this.prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: accept ? FriendStatus.ACCEPTED : FriendStatus.REJECTED },
    });
  }

  async removeFriend(userId: string, friendId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
        status: FriendStatus.ACCEPTED,
      },
    });
    if (!friendship) throw new NotFoundException('Amistad no encontrada');
    await this.prisma.friendship.delete({ where: { id: friendship.id } });
    return { removed: true };
  }

  async getFriends(userId: string) {
    const friendships = await this.prisma.friendship.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: FriendStatus.ACCEPTED,
      },
      include: {
        sender: { select: USER_SELECT },
        receiver: { select: USER_SELECT },
      },
    });

    return friendships.map((f) => ({
      friendshipId: f.id,
      friend: f.senderId === userId ? f.receiver : f.sender,
      since: f.updatedAt,
    }));
  }

  async getPendingRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: { receiverId: userId, status: FriendStatus.PENDING },
      include: { sender: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSentRequests(userId: string) {
    return this.prisma.friendship.findMany({
      where: { senderId: userId, status: FriendStatus.PENDING },
      include: { receiver: { select: USER_SELECT } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFriendshipStatus(userId: string, otherUserId: string) {
    const friendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
    });
    if (!friendship) return { status: 'NONE' };
    return {
      status: friendship.status,
      friendshipId: friendship.id,
      isSender: friendship.senderId === userId,
    };
  }
}
