import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const CONTENT_SELECT = {
  id: true, title: true, posterUrl: true, bannerUrl: true,
  type: true, releaseYear: true, genres: true, averageRating: true, duration: true,
};

@Injectable()
export class ListsService {
  constructor(private prisma: PrismaService) {}

  async getLists(profileId: string) {
    return this.prisma.userList.findMany({
      where: { profileId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { items: true } },
        items: {
          take: 4,
          orderBy: { addedAt: 'desc' },
          include: { content: { select: CONTENT_SELECT } },
        },
      },
    });
  }

  async getList(id: string, profileId: string) {
    const list = await this.prisma.userList.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: { addedAt: 'desc' },
          include: { content: { select: CONTENT_SELECT } },
        },
        _count: { select: { items: true } },
      },
    });
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.profileId !== profileId) throw new ForbiddenException();
    return list;
  }

  async createList(profileId: string, name: string, emoji = '📋') {
    return this.prisma.userList.create({
      data: { profileId, name, emoji },
      include: { _count: { select: { items: true } }, items: [] },
    });
  }

  async updateList(id: string, profileId: string, data: { name?: string; emoji?: string }) {
    const list = await this.prisma.userList.findUnique({ where: { id } });
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.profileId !== profileId) throw new ForbiddenException();
    return this.prisma.userList.update({ where: { id }, data });
  }

  async deleteList(id: string, profileId: string) {
    const list = await this.prisma.userList.findUnique({ where: { id } });
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.profileId !== profileId) throw new ForbiddenException();
    await this.prisma.userList.delete({ where: { id } });
    return { deleted: true };
  }

  async addItem(listId: string, contentId: string, profileId: string) {
    const list = await this.prisma.userList.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.profileId !== profileId) throw new ForbiddenException();

    const existing = await this.prisma.userListItem.findUnique({
      where: { listId_contentId: { listId, contentId } },
    });
    if (existing) return { added: false };

    await this.prisma.userListItem.create({ data: { listId, contentId } });
    return { added: true };
  }

  async removeItem(listId: string, contentId: string, profileId: string) {
    const list = await this.prisma.userList.findUnique({ where: { id: listId } });
    if (!list) throw new NotFoundException('Lista no encontrada');
    if (list.profileId !== profileId) throw new ForbiddenException();

    await this.prisma.userListItem.deleteMany({ where: { listId, contentId } });
    return { removed: true };
  }

  async getContentLists(contentId: string, profileId: string) {
    const lists = await this.prisma.userList.findMany({
      where: { profileId },
      include: {
        items: { where: { contentId }, select: { id: true } },
      },
    });
    return lists.map((l) => ({ ...l, hasContent: l.items.length > 0 }));
  }
}
