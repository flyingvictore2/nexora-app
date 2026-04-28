import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CouponsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async findOne(id: string) {
    const c = await this.prisma.coupon.findUnique({ where: { id } });
    if (!c) throw new NotFoundException('Cupón no encontrado');
    return c;
  }

  async validate(code: string, amount: number) {
    const c = await this.prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!c || !c.isActive) throw new BadRequestException('Cupón inválido o inactivo');
    if (c.expiresAt && c.expiresAt < new Date()) throw new BadRequestException('El cupón ha expirado');
    if (c.maxUses !== null && c.usedCount >= c.maxUses) throw new BadRequestException('El cupón ha alcanzado el límite de usos');
    if (amount < c.minAmount) throw new BadRequestException(`Importe mínimo para este cupón: ${c.minAmount}`);

    const discount = c.discountType === 'PERCENT'
      ? (amount * c.discountValue) / 100
      : Math.min(c.discountValue, amount);

    return {
      couponId: c.id,
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      discount: Math.round(discount * 100) / 100,
      finalAmount: Math.round((amount - discount) * 100) / 100,
    };
  }

  async use(code: string) {
    const c = await this.prisma.coupon.findUnique({ where: { code } });
    if (!c) return;
    await this.prisma.coupon.update({ where: { id: c.id }, data: { usedCount: { increment: 1 } } });
  }

  async create(data: any) {
    return this.prisma.coupon.create({
      data: { ...data, code: data.code.toUpperCase() },
    });
  }

  async update(id: string, data: any) {
    await this.findOne(id);
    return this.prisma.coupon.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.coupon.delete({ where: { id } });
    return { deleted: true };
  }
}
