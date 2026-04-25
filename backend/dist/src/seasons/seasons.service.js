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
exports.SeasonsService = exports.CreateSeasonDto = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
class CreateSeasonDto {
}
exports.CreateSeasonDto = CreateSeasonDto;
let SeasonsService = class SeasonsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByContent(contentId) {
        return this.prisma.season.findMany({
            where: { contentId },
            orderBy: { number: 'asc' },
            include: {
                episodes: {
                    orderBy: { number: 'asc' },
                    include: { subtitles: true },
                },
                _count: { select: { episodes: true } },
            },
        });
    }
    async findOne(id) {
        const season = await this.prisma.season.findUnique({
            where: { id },
            include: {
                episodes: {
                    orderBy: { number: 'asc' },
                    include: { subtitles: true },
                },
            },
        });
        if (!season)
            throw new common_1.NotFoundException('Season not found');
        return season;
    }
    async create(dto) {
        const exists = await this.prisma.season.findFirst({
            where: { contentId: dto.contentId, number: dto.number },
        });
        if (exists)
            throw new common_1.ConflictException(`Season ${dto.number} already exists`);
        return this.prisma.season.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.season.update({ where: { id }, data: dto });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.season.delete({ where: { id } });
        return { message: 'Season deleted' };
    }
};
exports.SeasonsService = SeasonsService;
exports.SeasonsService = SeasonsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SeasonsService);
//# sourceMappingURL=seasons.service.js.map