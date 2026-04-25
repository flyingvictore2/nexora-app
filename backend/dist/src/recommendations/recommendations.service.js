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
exports.RecommendationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RecommendationsService = class RecommendationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getForProfile(profileId) {
        const history = await this.prisma.watchHistory.findMany({
            where: { profileId },
            include: { content: { select: { genres: true, type: true } } },
            orderBy: { watchedAt: 'desc' },
            take: 20,
        });
        const watchedIds = history.map((h) => h.contentId);
        const genreCounts = new Map();
        history.forEach((h) => {
            h.content?.genres?.forEach((g) => {
                genreCounts.set(g, (genreCounts.get(g) || 0) + 1);
            });
        });
        const topGenres = Array.from(genreCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([g]) => g);
        const favorites = await this.prisma.favorite.findMany({
            where: { profileId },
            include: { content: { select: { genres: true } } },
        });
        const favoriteGenres = favorites.flatMap((f) => f.content?.genres || []);
        const allGenres = [...new Set([...topGenres, ...favoriteGenres])].slice(0, 5);
        if (allGenres.length === 0) {
            return this.prisma.content.findMany({
                where: { isPublished: true, isTrending: true },
                take: 20,
                orderBy: { totalViews: 'desc' },
            });
        }
        const recommended = await this.prisma.content.findMany({
            where: {
                isPublished: true,
                id: { notIn: watchedIds },
                genres: { hasSome: allGenres },
            },
            take: 30,
            orderBy: [{ averageRating: 'desc' }, { totalViews: 'desc' }],
        });
        return recommended.sort(() => Math.random() - 0.5).slice(0, 20);
    }
    async getSimilar(contentId) {
        const content = await this.prisma.content.findUnique({
            where: { id: contentId },
            select: { genres: true, type: true, director: true },
        });
        if (!content)
            return [];
        return this.prisma.content.findMany({
            where: {
                isPublished: true,
                id: { not: contentId },
                type: content.type,
                OR: [
                    { genres: { hasSome: content.genres } },
                    { director: content.director || undefined },
                ],
            },
            take: 12,
            orderBy: { averageRating: 'desc' },
        });
    }
    async getTopRated(type) {
        return this.prisma.content.findMany({
            where: {
                isPublished: true,
                averageRating: { gt: 3 },
                ...(type ? { type: type } : {}),
            },
            take: 20,
            orderBy: { averageRating: 'desc' },
        });
    }
};
exports.RecommendationsService = RecommendationsService;
exports.RecommendationsService = RecommendationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecommendationsService);
//# sourceMappingURL=recommendations.service.js.map