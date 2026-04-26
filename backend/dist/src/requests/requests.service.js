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
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RequestsService = class RequestsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.contentRequest.create({
            data: { userId, title: dto.title, type: dto.type, description: dto.description },
        });
    }
    async findByUser(userId) {
        return this.prisma.contentRequest.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = query.status ? { status: query.status } : {};
        const [requests, total] = await Promise.all([
            this.prisma.contentRequest.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true } } },
            }),
            this.prisma.contentRequest.count({ where }),
        ]);
        return { requests, total, page, totalPages: Math.ceil(total / limit) };
    }
    async updateStatus(id, status, adminNote) {
        const req = await this.prisma.contentRequest.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Solicitud no encontrada');
        return this.prisma.contentRequest.update({
            where: { id },
            data: { status: status, adminNote },
        });
    }
    async getStats() {
        const [total, pending, approved, rejected] = await Promise.all([
            this.prisma.contentRequest.count(),
            this.prisma.contentRequest.count({ where: { status: 'PENDING' } }),
            this.prisma.contentRequest.count({ where: { status: 'APPROVED' } }),
            this.prisma.contentRequest.count({ where: { status: 'REJECTED' } }),
        ]);
        return { total, pending, approved, rejected };
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map