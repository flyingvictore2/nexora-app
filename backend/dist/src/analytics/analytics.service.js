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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboardMetrics() {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const [totalUsers, newUsersThisMonth, activeSubscriptions, totalContent, totalRevenue, monthRevenue, totalWatchTime,] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
            this.prisma.subscription.count({ where: { status: { in: ['ACTIVE', 'TRIAL'] } } }),
            this.prisma.content.count({ where: { isPublished: true } }),
            this.prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
            this.prisma.payment.aggregate({
                where: { status: 'COMPLETED', createdAt: { gte: startOfMonth } },
                _sum: { amount: true },
            }),
            this.prisma.watchHistory.aggregate({ _sum: { duration: true } }),
        ]);
        return {
            totalUsers,
            newUsersThisMonth,
            activeSubscriptions,
            totalContent,
            totalRevenue: totalRevenue._sum.amount || 0,
            monthRevenue: monthRevenue._sum.amount || 0,
            totalWatchTimeHours: Math.floor((totalWatchTime._sum.duration || 0) / 3600),
        };
    }
    async getMostWatched(limit = 10, type) {
        const where = { isPublished: true };
        if (type)
            where.type = type;
        return this.prisma.content.findMany({
            where,
            take: limit,
            orderBy: { totalViews: 'desc' },
            select: {
                id: true,
                title: true,
                posterUrl: true,
                type: true,
                totalViews: true,
                averageRating: true,
                _count: { select: { ratings: true } },
            },
        });
    }
    async getUserGrowth(months = 6) {
        const results = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const count = await this.prisma.user.count({
                where: { createdAt: { gte: start, lte: end } },
            });
            results.push({
                month: start.toISOString().slice(0, 7),
                users: count,
            });
        }
        return results;
    }
    async getRevenueByMonth(months = 6) {
        const results = [];
        const now = new Date();
        for (let i = months - 1; i >= 0; i--) {
            const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
            const agg = await this.prisma.payment.aggregate({
                where: { status: 'COMPLETED', createdAt: { gte: start, lte: end } },
                _sum: { amount: true },
            });
            results.push({
                month: start.toISOString().slice(0, 7),
                revenue: agg._sum.amount || 0,
            });
        }
        return results;
    }
    async getContentByType() {
        return this.prisma.content.groupBy({
            by: ['type'],
            _count: true,
            where: { isPublished: true },
        });
    }
    async getSubscriptionDistribution() {
        const subs = await this.prisma.subscription.findMany({
            where: { status: { in: ['ACTIVE', 'TRIAL'] } },
            include: { plan: { select: { name: true, planType: true } } },
        });
        const dist = new Map();
        subs.forEach((s) => {
            const key = s.plan?.planType || 'UNKNOWN';
            dist.set(key, (dist.get(key) || 0) + 1);
        });
        return Array.from(dist.entries()).map(([plan, count]) => ({ plan, count }));
    }
    async getWatchTimeByDay(days = 7) {
        const results = [];
        const now = new Date();
        for (let i = days - 1; i >= 0; i--) {
            const start = new Date(now);
            start.setDate(now.getDate() - i);
            start.setHours(0, 0, 0, 0);
            const end = new Date(start);
            end.setHours(23, 59, 59, 999);
            const agg = await this.prisma.watchHistory.aggregate({
                where: { watchedAt: { gte: start, lte: end } },
                _sum: { duration: true },
                _count: true,
            });
            results.push({
                date: start.toISOString().slice(0, 10),
                totalMinutes: Math.floor((agg._sum.duration || 0) / 60),
                sessions: agg._count,
            });
        }
        return results;
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map