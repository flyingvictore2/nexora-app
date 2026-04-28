import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CONTENT_SELECT = { id: true, title: true, posterUrl: true, type: true, videoUrl: true, duration: true };
const USER_SELECT = { id: true, name: true, avatar: true, email: true };

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

@Injectable()
export class WatchPartyService {
  constructor(private prisma: PrismaService) {}

  async createParty(hostId: string, contentId: string, episodeId?: string) {
    let code = generateCode();
    // Ensure unique code
    while (await this.prisma.watchParty.findUnique({ where: { code } })) {
      code = generateCode();
    }

    const party = await this.prisma.watchParty.create({
      data: {
        code,
        hostId,
        contentId,
        episodeId,
        members: { create: { userId: hostId } },
      },
      include: {
        content: { select: CONTENT_SELECT },
        host: { select: USER_SELECT },
        members: { include: { user: { select: USER_SELECT } } },
      },
    });

    return party;
  }

  async joinParty(code: string, userId: string) {
    const party = await this.prisma.watchParty.findUnique({
      where: { code },
      include: {
        content: { select: CONTENT_SELECT },
        host: { select: USER_SELECT },
        members: { include: { user: { select: USER_SELECT } } },
      },
    });

    if (!party) throw new NotFoundException('Sala no encontrada');
    if (!party.isActive) throw new ForbiddenException('La sala ya no está activa');

    // Add member if not already there
    await this.prisma.watchPartyMember.upsert({
      where: { partyId_userId: { partyId: party.id, userId } },
      create: { partyId: party.id, userId },
      update: {},
    });

    return this.getParty(party.id);
  }

  async getParty(id: string) {
    return this.prisma.watchParty.findUnique({
      where: { id },
      include: {
        content: { select: CONTENT_SELECT },
        host: { select: USER_SELECT },
        members: { include: { user: { select: USER_SELECT } } },
        messages: {
          take: 50,
          orderBy: { createdAt: 'asc' },
          include: { user: { select: USER_SELECT } },
        },
      },
    });
  }

  async updatePlayback(id: string, hostId: string, position: number, isPlaying: boolean) {
    const party = await this.prisma.watchParty.findUnique({ where: { id } });
    if (!party) throw new NotFoundException();
    if (party.hostId !== hostId) throw new ForbiddenException('Solo el host puede controlar la reproducción');

    return this.prisma.watchParty.update({
      where: { id },
      data: { position, isPlaying },
    });
  }

  async addMessage(partyId: string, userId: string, message: string) {
    return this.prisma.watchPartyMessage.create({
      data: { partyId, userId, message },
      include: { user: { select: USER_SELECT } },
    });
  }

  async closeParty(id: string, hostId: string) {
    const party = await this.prisma.watchParty.findUnique({ where: { id } });
    if (!party) throw new NotFoundException();
    if (party.hostId !== hostId) throw new ForbiddenException();
    return this.prisma.watchParty.update({ where: { id }, data: { isActive: false } });
  }

  async getUserParties(userId: string) {
    return this.prisma.watchParty.findMany({
      where: {
        OR: [
          { hostId: userId },
          { members: { some: { userId } } },
        ],
        isActive: true,
      },
      include: {
        content: { select: CONTENT_SELECT },
        host: { select: USER_SELECT },
        _count: { select: { members: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
