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
exports.ProfilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = require("bcryptjs");
let ProfilesService = class ProfilesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.MAX_PROFILES = 4;
    }
    async findAll(userId) {
        return this.prisma.profile.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        });
    }
    async findOne(id, userId) {
        const profile = await this.prisma.profile.findFirst({ where: { id, userId } });
        if (!profile)
            throw new common_1.NotFoundException('Profile not found');
        return profile;
    }
    async create(userId, dto) {
        const count = await this.prisma.profile.count({ where: { userId } });
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId },
            include: { plan: true },
        });
        const maxProfiles = subscription?.plan?.maxProfiles || 1;
        if (count >= maxProfiles) {
            throw new common_1.BadRequestException(`Your plan allows up to ${maxProfiles} profiles`);
        }
        let pin;
        if (dto.pin)
            pin = await bcrypt.hash(dto.pin, 10);
        return this.prisma.profile.create({
            data: {
                userId,
                name: dto.name,
                avatar: dto.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.name}`,
                isKids: dto.isKids || false,
                language: dto.language || 'es',
                isDefault: count === 0,
                pin,
            },
        });
    }
    async update(id, userId, dto) {
        const profile = await this.findOne(id, userId);
        let pin = profile.pin;
        if (dto.pin)
            pin = await bcrypt.hash(dto.pin, 10);
        if (dto.pin === '')
            pin = null;
        return this.prisma.profile.update({
            where: { id },
            data: {
                ...dto,
                pin: dto.pin !== undefined ? pin : undefined,
            },
        });
    }
    async delete(id, userId) {
        const profile = await this.findOne(id, userId);
        if (profile.isDefault)
            throw new common_1.BadRequestException('Cannot delete the default profile');
        await this.prisma.profile.delete({ where: { id } });
        return { message: 'Profile deleted' };
    }
    async setDefault(id, userId) {
        await this.findOne(id, userId);
        await this.prisma.profile.updateMany({ where: { userId }, data: { isDefault: false } });
        return this.prisma.profile.update({ where: { id }, data: { isDefault: true } });
    }
    async verifyPin(id, userId, pin) {
        const profile = await this.findOne(id, userId);
        if (!profile.pin)
            return { valid: true };
        const valid = await bcrypt.compare(pin, profile.pin);
        return { valid };
    }
};
exports.ProfilesService = ProfilesService;
exports.ProfilesService = ProfilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProfilesService);
//# sourceMappingURL=profiles.service.js.map