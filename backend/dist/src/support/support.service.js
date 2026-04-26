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
exports.SupportService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SupportService = class SupportService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.supportTicket.create({
            data: {
                userId,
                subject: dto.subject,
                message: dto.message,
                category: dto.category || 'OTHER',
            },
        });
    }
    async findByUser(userId) {
        return this.prisma.supportTicket.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.status)
            where.status = query.status;
        if (query.category)
            where.category = query.category;
        const [tickets, total] = await Promise.all([
            this.prisma.supportTicket.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { email: true } } },
            }),
            this.prisma.supportTicket.count({ where }),
        ]);
        return { tickets, total, page, totalPages: Math.ceil(total / limit) };
    }
    async reply(id, adminReply, status) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket no encontrado');
        return this.prisma.supportTicket.update({
            where: { id },
            data: {
                adminReply,
                status: status || 'IN_PROGRESS',
            },
        });
    }
    async updateStatus(id, status) {
        const ticket = await this.prisma.supportTicket.findUnique({ where: { id } });
        if (!ticket)
            throw new common_1.NotFoundException('Ticket no encontrado');
        return this.prisma.supportTicket.update({ where: { id }, data: { status: status } });
    }
    async getStats() {
        const [total, open, inProgress, resolved, closed] = await Promise.all([
            this.prisma.supportTicket.count(),
            this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
            this.prisma.supportTicket.count({ where: { status: 'IN_PROGRESS' } }),
            this.prisma.supportTicket.count({ where: { status: 'RESOLVED' } }),
            this.prisma.supportTicket.count({ where: { status: 'CLOSED' } }),
        ]);
        return { total, open, inProgress, resolved, closed };
    }
};
exports.SupportService = SupportService;
exports.SupportService = SupportService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SupportService);
//# sourceMappingURL=support.service.js.map