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
exports.RatingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RatingsService = class RatingsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async rate(userId, profileId, contentId, rating, review) {
        const content = await this.prisma.content.findUnique({ where: { id: contentId } });
        if (!content)
            throw new common_1.NotFoundException('Content not found');
        const result = await this.prisma.rating.upsert({
            where: { profileId_contentId: { profileId, contentId } },
            create: { userId, profileId, contentId, rating, review },
            update: { rating, review },
        });
        const stats = await this.prisma.rating.aggregate({
            where: { contentId },
            _avg: { rating: true },
            _count: true,
        });
        await this.prisma.content.update({
            where: { id: contentId },
            data: { averageRating: stats._avg.rating || 0 },
        });
        return result;
    }
    async getForContent(contentId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [ratings, total] = await Promise.all([
            this.prisma.rating.findMany({
                where: { contentId },
                include: { profile: { select: { id: true, name: true, avatar: true } } },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.rating.count({ where: { contentId } }),
        ]);
        return { ratings, total, page, totalPages: Math.ceil(total / limit) };
    }
    async getUserRating(profileId, contentId) {
        return this.prisma.rating.findUnique({
            where: { profileId_contentId: { profileId, contentId } },
        });
    }
    async delete(id, userId) {
        await this.prisma.rating.deleteMany({ where: { id, userId } });
        return { message: 'Rating removed' };
    }
};
exports.RatingsService = RatingsService;
exports.RatingsService = RatingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingsService);
//# sourceMappingURL=ratings.service.js.map