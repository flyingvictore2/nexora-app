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
exports.WatchHistoryService = exports.UpdateProgressDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
class UpdateProgressDto {
}
exports.UpdateProgressDto = UpdateProgressDto;
let WatchHistoryService = class WatchHistoryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async updateProgress(userId, dto) {
        const completed = dto.duration > 0 && dto.progress / dto.duration >= 0.9;
        const episodeId = dto.episodeId ?? null;
        return this.prisma.watchHistory.upsert({
            where: {
                profileId_contentId_episodeId: {
                    profileId: dto.profileId,
                    contentId: dto.contentId,
                    episodeId: episodeId,
                },
            },
            create: {
                userId,
                profileId: dto.profileId,
                contentId: dto.contentId,
                episodeId,
                progress: dto.progress,
                duration: dto.duration,
                completed,
                watchedAt: new Date(),
            },
            update: { progress: dto.progress, duration: dto.duration, completed, watchedAt: new Date() },
        });
    }
    async getHistory(profileId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [history, total] = await Promise.all([
            this.prisma.watchHistory.findMany({
                where: { profileId },
                include: {
                    content: { select: { id: true, title: true, posterUrl: true, type: true, duration: true } },
                    episode: { select: { id: true, number: true, title: true, season: { select: { number: true } } } },
                },
                orderBy: { watchedAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.watchHistory.count({ where: { profileId } }),
        ]);
        return { history, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getContinueWatching(profileId) {
        return this.prisma.watchHistory.findMany({
            where: { profileId, completed: false, progress: { gt: 0 } },
            include: {
                content: {
                    select: {
                        id: true,
                        title: true,
                        posterUrl: true,
                        bannerUrl: true,
                        type: true,
                        duration: true,
                        _count: { select: { seasons: true } },
                    },
                },
                episode: {
                    select: {
                        id: true,
                        number: true,
                        title: true,
                        thumbnailUrl: true,
                        duration: true,
                        season: { select: { number: true, contentId: true } },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
    }
    async getProgress(profileId, contentId, episodeId) {
        return this.prisma.watchHistory.findFirst({
            where: {
                profileId,
                contentId,
                episodeId: episodeId ?? null,
            },
        });
    }
    async deleteHistoryItem(id, userId) {
        await this.prisma.watchHistory.deleteMany({ where: { id, userId } });
        return { message: 'Removed from history' };
    }
    async clearHistory(profileId, userId) {
        await this.prisma.watchHistory.deleteMany({ where: { profileId, userId } });
        return { message: 'History cleared' };
    }
};
exports.WatchHistoryService = WatchHistoryService;
exports.WatchHistoryService = WatchHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WatchHistoryService);
//# sourceMappingURL=watch-history.service.js.map