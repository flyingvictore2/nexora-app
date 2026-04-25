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
exports.EpisodesService = exports.CreateEpisodeDto = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const prisma_service_1 = require("../prisma/prisma.service");
class CreateEpisodeDto {
}
exports.CreateEpisodeDto = CreateEpisodeDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEpisodeDto.prototype, "seasonId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateEpisodeDto.prototype, "number", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEpisodeDto.prototype, "title", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEpisodeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEpisodeDto.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEpisodeDto.prototype, "videoUrl", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateEpisodeDto.prototype, "duration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateEpisodeDto.prototype, "releaseDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEpisodeDto.prototype, "isPublished", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateEpisodeDto.prototype, "introStart", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_transformer_1.Type)(() => Number),
    __metadata("design:type", Number)
], CreateEpisodeDto.prototype, "introEnd", void 0);
let EpisodesService = class EpisodesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findBySeason(seasonId) {
        return this.prisma.episode.findMany({
            where: { seasonId },
            orderBy: { number: 'asc' },
            include: { subtitles: true },
        });
    }
    async findOne(id) {
        const ep = await this.prisma.episode.findUnique({
            where: { id },
            include: {
                subtitles: true,
                season: { include: { content: { select: { id: true, title: true, type: true } } } },
            },
        });
        if (!ep)
            throw new common_1.NotFoundException('Episode not found');
        return ep;
    }
    async create(dto) {
        return this.prisma.episode.create({ data: dto });
    }
    async update(id, dto) {
        await this.findOne(id);
        return this.prisma.episode.update({ where: { id }, data: dto });
    }
    async delete(id) {
        await this.findOne(id);
        await this.prisma.episode.delete({ where: { id } });
        return { message: 'Episode deleted' };
    }
    async addSubtitle(episodeId, subtitle) {
        await this.findOne(episodeId);
        return this.prisma.subtitle.create({ data: { episodeId, ...subtitle } });
    }
    async removeSubtitle(subtitleId) {
        return this.prisma.subtitle.delete({ where: { id: subtitleId } });
    }
    async incrementView(id) {
        await this.prisma.episode.update({
            where: { id },
            data: { views: { increment: 1 } },
        });
    }
};
exports.EpisodesService = EpisodesService;
exports.EpisodesService = EpisodesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], EpisodesService);
//# sourceMappingURL=episodes.service.js.map