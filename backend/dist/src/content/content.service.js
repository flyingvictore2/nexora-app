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
exports.ContentService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let ContentService = class ContentService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async findAll(query) {
        const { page = 1, limit = 20, search, type, genre, language, sortBy = 'createdAt', sortOrder = 'desc', isFeatured, isTrending } = query;
        const skip = (page - 1) * limit;
        const where = { isPublished: true };
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { cast: { has: search } },
                { director: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (type)
            where.type = type;
        if (genre)
            where.genres = { has: genre };
        if (language)
            where.language = language;
        if (isFeatured !== undefined)
            where.isFeatured = isFeatured;
        if (isTrending !== undefined)
            where.isTrending = isTrending;
        where.AND = [
            { OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }] },
        ];
        const orderBy = {};
        orderBy[sortBy] = sortOrder;
        const [content, total] = await Promise.all([
            this.prisma.content.findMany({
                where,
                skip,
                take: +limit,
                orderBy,
                include: {
                    subtitles: true,
                    _count: { select: { seasons: true, watchHistory: true } },
                },
            }),
            this.prisma.content.count({ where }),
        ]);
        return { content, total, page: +page, limit: +limit, totalPages: Math.ceil(total / +limit) };
    }
    async findOne(id) {
        const content = await this.prisma.content.findUnique({
            where: { id },
            include: {
                seasons: {
                    orderBy: { number: 'asc' },
                    include: {
                        episodes: { orderBy: { number: 'asc' }, include: { subtitles: true } },
                    },
                },
                subtitles: true,
                _count: { select: { ratings: true, favorites: true, watchHistory: true } },
            },
        });
        if (!content)
            throw new common_1.NotFoundException('Content not found');
        return content;
    }
    async getSignedUrl(contentId, userId, episodeId) {
        const content = await this.prisma.content.findUnique({ where: { id: contentId } });
        if (!content)
            throw new common_1.NotFoundException('Content not found');
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        const planOrder = { FREE: 0, PREMIUM: 1, VIP: 2 };
        const userPlanLevel = planOrder[subscription?.plan?.planType || 'FREE'];
        const requiredLevel = planOrder[content.requiredPlan];
        if (userPlanLevel < requiredLevel) {
            throw new common_1.ForbiddenException('Upgrade your plan to access this content');
        }
        let videoUrl = content.videoUrl;
        if (episodeId) {
            const episode = await this.prisma.episode.findUnique({ where: { id: episodeId } });
            if (!episode)
                throw new common_1.NotFoundException('Episode not found');
            videoUrl = episode.videoUrl;
        }
        const secret = this.config.get('SIGNED_URL_SECRET', 'default_secret');
        const expiry = Date.now() + (this.config.get('SIGNED_URL_EXPIRY', 3600) * 1000);
        const signature = crypto
            .createHmac('sha256', secret)
            .update(`${videoUrl}:${userId}:${expiry}`)
            .digest('hex');
        return {
            url: videoUrl,
            signedToken: signature,
            expiresAt: new Date(expiry),
        };
    }
    async getFeatured() {
        return this.prisma.content.findMany({
            where: { isFeatured: true, isPublished: true },
            take: 5,
            orderBy: { totalViews: 'desc' },
            include: { subtitles: true },
        });
    }
    async getTrending() {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return this.prisma.content.findMany({
            where: { isTrending: true, isPublished: true },
            take: 20,
            orderBy: { totalViews: 'desc' },
            include: {
                _count: { select: { watchHistory: true } },
            },
        });
    }
    async getByGenre(genre, limit = 20) {
        return this.prisma.content.findMany({
            where: { genres: { has: genre }, isPublished: true },
            take: +limit,
            orderBy: { totalViews: 'desc' },
        });
    }
    async getNewReleases() {
        return this.prisma.content.findMany({
            where: { isNew: true, isPublished: true },
            take: 20,
            orderBy: { releaseDate: 'desc' },
        });
    }
    async create(dto) {
        return this.prisma.content.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.content.update({ where: { id }, data: dto });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.content.delete({ where: { id } });
        return { message: 'Content deleted' };
    }
    async incrementView(id) {
        await this.prisma.content.update({
            where: { id },
            data: { totalViews: { increment: 1 } },
        });
    }
    async getAllGenres() {
        const content = await this.prisma.content.findMany({
            where: { isPublished: true },
            select: { genres: true },
        });
        const genreSet = new Set();
        content.forEach((c) => c.genres.forEach((g) => genreSet.add(g)));
        return Array.from(genreSet).sort();
    }
    async getContinueWatching(profileId) {
        return this.prisma.watchHistory.findMany({
            where: { profileId, completed: false, progress: { gt: 0 } },
            include: {
                content: { include: { _count: { select: { seasons: true } } } },
                episode: { include: { season: true } },
            },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
    }
};
exports.ContentService = ContentService;
exports.ContentService = ContentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], ContentService);
//# sourceMappingURL=content.service.js.map