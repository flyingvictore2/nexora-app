"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubscriptionsService = class SubscriptionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getPlans() {
        return this.prisma.plan.findMany({
            where: { isActive: true },
            orderBy: { price: 'asc' },
        });
    }
    async getPlanById(id) {
        const plan = await this.prisma.plan.findUnique({ where: { id } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        return plan;
    }
    async getUserSubscription(userId) {
        const sub = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        if (!sub)
            throw new common_1.NotFoundException('No active subscription');
        return sub;
    }
    async createPlan(data) {
        return this.prisma.plan.create({ data });
    }
    async updatePlan(id, data) {
        await this.getPlanById(id);
        return this.prisma.plan.update({ where: { id }, data });
    }
    async cancelSubscription(userId) {
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
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map