import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: { title: string; type: string; description?: string }) {
    return this.prisma.contentRequest.create({
      data: { userId, title: dto.title, type: dto.type as any, description: dto.description },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.contentRequest.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(query: { status?: string; page?: number; limit?: number }) {
    const page  = Number(query.page)  || 1;
    const limit = Number(query.limit) || 20;
    const skip  = (page - 1) * limit;
    const where = query.status ? { status: query.status as any } : {};

    const [requests, total] = await Promise.all([
      this.prisma.contentRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      }),
      this.prisma.contentRequest.count({ where }),
    ]);

    return { requests, total, page, totalPages: Math.ceil(total / limit) };
  }

  async updateStatus(id: string, status: string, adminNote?: string) {
    const req = await this.prisma.contentRequest.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Solicitud no encontrada');
    return this.prisma.contentRequest.update({
      where: { id },
      data: { status: status as any, adminNote },
    });
  }

  async getStats() {
    const [total, pending, approved, rejected] = await Promise.all([
      this.prisma.contentRequest.count(),
      this.prisma.contentRequest.count({ where: { status: 'PENDING' } }),
      this.prisma.contentRequest.count({ where: { status: 'APPROVED' } }),
      this.prisma.contentRequest.count({ where: { status: 'REJECTED' } }),
    ]);
    return { total, pending, approved, rejected };
  }
}
