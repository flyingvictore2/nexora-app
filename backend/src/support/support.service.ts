import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: { subject: string; message: string; category?: string }) {
    return this.prisma.supportTicket.create({
      data: {
        userId,
        subject: dto.subject,
        message: dto.message,
        category: (dto.category as any) || 'OTHER',
      },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(query: { status?: string; category?: string; page?: number; limit?: number }) {
    const page  = Number(query.page)  || 1;
    const limit = Number(query.limit) || 20;
    const skip  = (page - 1) * limit;

    const where: any = {};
    if (query.status)   where.status   = query.status;
    if (query.category) where.category = query.category;

    const [tickets, total] = await Promise.all([
      this.prisma.supportTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      this.prisma.supportTicket.count({ where }),
    ]);

    return { tickets, total, page, totalPages: Math.ceil(total / limit) };
  }

  async reply(id: string, adminReply: string, status?: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return this.prisma.supportTicket.update({
      where: { id },
      data: {
        adminReply,
        status: (status as any) || 'IN_PROGRESS',
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket no encontrado');
    return this.prisma.supportTicket.update({ where: { id }, data: { status: status as any } });
  }

  async getStats() {
    const [total, open, inProgress, resolved, closed] = await Promise.all([
      this.prisma.supportTicket.count(),
      this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
      this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
      this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
      this.prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
    ]);
    return { total, open, inProgress, resolved, closed };
  }
}
