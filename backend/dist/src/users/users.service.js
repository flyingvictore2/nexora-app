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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(page = 1, limit = 20, search) {
        const skip = (page - 1) * limit;
        const where = search
            ? { OR: [{ email: { contains: search, mode: 'insensitive' } }] }
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
    async findOne(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: {
                profiles: true,
                subscription: { include: { plan: true } },
                _count: { select: { watchHistory: true, ratings: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { password, refreshToken, emailVerifyToken, resetPasswordToken, ...safe } = user;
        return safe;
    }
    async update(id, dto) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
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
    async block(id) {
        return this.prisma.user.update({
            where: { id },
            data: { isBlocked: true, refreshToken: null },
            select: { id: true, email: true, isBlocked: true },
        });
    }
    async unblock(id) {
        return this.prisma.user.update({
            where: { id },
            data: { isBlocked: false },
            select: { id: true, email: true, isBlocked: true },
        });
    }
    async getActivity(userId) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map