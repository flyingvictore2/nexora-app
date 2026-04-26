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
exports.FavoritesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FavoritesService = class FavoritesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async toggle(profileId, contentId) {
        const existing = await this.prisma.favorite.findUnique({
            where: { profileId_contentId: { profileId, contentId } },
        });
        if (existing) {
            await this.prisma.favorite.delete({ where: { id: existing.id } });
            return { added: false, message: 'Removed from favorites' };
        }
        await this.prisma.favorite.create({ data: { profileId, contentId } });
        return { added: true, message: 'Added to favorites' };
    }
    async getAll(profileId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [favorites, total] = await Promise.all([
            this.prisma.favorite.findMany({
                where: { profileId },
                include: {
                    content: {
                        select: {
                            id: true,
                            title: true,
                            posterUrl: true,
                            bannerUrl: true,
                            type: true,
                            releaseYear: true,
                            genres: true,
                            averageRating: true,
                            duration: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.favorite.count({ where: { profileId } }),
        ]);
        return { favorites, total, page, totalPages: Math.ceil(total / limit) };
    }
    async isFavorite(profileId, contentId) {
        const fav = await this.prisma.favorite.findUnique({
            where: { profileId_contentId: { profileId, contentId } },
        });
        return { isFavorite: !!fav };
    }
};
exports.FavoritesService = FavoritesService;
exports.FavoritesService = FavoritesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FavoritesService);
//# sourceMappingURL=favorites.service.js.map