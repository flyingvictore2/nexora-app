import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getPlans() {
    return this.prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async getAllPlans() {
    return this.prisma.plan.findMany({ orderBy: { price: 'asc' } });
  }

  async getPlanById(id: string) {
    const plan = await this.prisma.plan.findUnique({ where: { id } });
    if (!plan) throw new NotFoundException('Plan not found');
    return plan;
  }

  async getUserSubscription(userId: string) {
    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });
    if (!sub) throw new NotFoundException('No active subscription');
    return sub;
  }

  async createPlan(data: {
    name: string;
    planType: SubscriptionPlan;
    price: number;
    currency?: string;
    description?: string;
    features?: string[];
    maxProfiles: number;
    maxDevices: number;
    videoQuality: string;
    hasDownloads?: boolean;
    trialDays?: number;
    stripeProductId?: string;
    stripePriceId?: string;
  }) {
    return this.prisma.plan.create({ data });
  }

  async updatePlan(id: string, data: any) {
    await this.getPlanById(id);
    return this.prisma.plan.update({ where: { id }, data });
  }

  async deletePlan(id: string) {
    await this.getPlanById(id);
    const activeCount = await this.prisma.subscription.count({
      where: { planId: id, status: { in: ['ACTIVE', 'TRIAL'] } },
    });
    if (activeCount > 0) {
      // Soft delete — keep plan but mark inactive
      return this.prisma.plan.update({ where: { id }, data: { isActive: false } });
    }
    return this.prisma.plan.delete({ where: { id } });
  }

  async getAllUserSubscriptions(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [subscriptions, total] = await Promise.all([
      this.prisma.subscription.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true, avatar: true } },
          plan: { select: { name: true, planType: true, price: true, currency: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.subscription.count({ where }),
    ]);

    return { subscriptions, total, page, totalPages: Math.ceil(total / limit) };
  }

  async adminCancelSubscription(subscriptionId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { id: subscriptionId } });
    if (!sub) throw new Error('Subscription not found');
    return this.prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: 'CANCELLED', cancelAtPeriodEnd: true },
    });
  }

  async cancelSubscription(userId: string) {
    const sub = await this.getUserSubscription(userId);
    return this.prisma.subscription.update({
      where: { id: sub.id },
      data: { cancelAtPeriodEnd: true },
    });
  }

  async getSubscriptionStats() {
    const [total, active, trial, cancelled] = await Promise.all([
      this.prisma.subscription.count(),
      this.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      this.prisma.subscription.count({ where: { status: 'TRIAL' } }),
      this.prisma.subscription.count({ where: { status: 'CANCELLED' } }),
    ]);

    const byPlan = await this.prisma.subscription.groupBy({
      by: ['planId'],
      _count: true,
      where: { status: { in: ['ACTIVE', 'TRIAL'] } },
    });

    return { total, active, trial, cancelled, byPlan };
  }
}
