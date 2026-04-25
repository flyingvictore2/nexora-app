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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = require("bcryptjs");
const uuid_1 = require("uuid");
const prisma_service_1 = require("../prisma/prisma.service");
const notifications_service_1 = require("../notifications/notifications.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, config, notificationsService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.config = config;
        this.notificationsService = notificationsService;
    }
    async register(dto) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        const hashedPassword = await bcrypt.hash(dto.password, 12);
        const verifyToken = (0, uuid_1.v4)();
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                emailVerifyToken: verifyToken,
                profiles: {
                    create: {
                        name: dto.name,
                        isDefault: true,
                        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${dto.name}`,
                    },
                },
            },
            include: { profiles: true },
        });
        const freePlan = await this.prisma.plan.findFirst({ where: { planType: 'FREE' } });
        if (freePlan) {
            const now = new Date();
            const end = new Date(now);
            end.setFullYear(end.getFullYear() + 1);
            await this.prisma.subscription.create({
                data: {
                    userId: user.id,
                    planId: freePlan.id,
                    status: 'ACTIVE',
                    currentPeriodStart: now,
                    currentPeriodEnd: end,
                },
            });
        }
        await this.notificationsService.sendVerificationEmail(user.email, verifyToken);
        await this.notificationsService.createInAppNotification(user.id, '¡Bienvenido a Nexora! 🎬', 'Tu cuenta ha sido creada. Verifica tu email para acceder a todo el contenido.', 'system');
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        const { password, refreshToken, emailVerifyToken: _, ...safeUser } = user;
        return { user: safeUser, ...tokens };
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: { profiles: { where: { isDefault: true }, take: 1 } },
        });
        if (!user || !user.password)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.isBlocked)
            throw new common_1.UnauthorizedException('Account is blocked');
        const isMatch = await bcrypt.compare(dto.password, user.password);
        if (!isMatch)
            throw new common_1.UnauthorizedException('Invalid credentials');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        const { password, refreshToken, emailVerifyToken, resetPasswordToken, ...safeUser } = user;
        return { user: safeUser, ...tokens };
    }
    async loginGoogle(googleUser) {
        let user = await this.prisma.user.findFirst({
            where: { OR: [{ googleId: googleUser.googleId }, { email: googleUser.email }] },
        });
        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: googleUser.email,
                    googleId: googleUser.googleId,
                    isEmailVerified: true,
                    profiles: {
                        create: {
                            name: googleUser.name,
                            avatar: googleUser.avatar,
                            isDefault: true,
                        },
                    },
                },
            });
            const freePlan = await this.prisma.plan.findFirst({ where: { planType: 'FREE' } });
            if (freePlan) {
                const now = new Date();
                const end = new Date(now);
                end.setFullYear(end.getFullYear() + 1);
                await this.prisma.subscription.create({
                    data: {
                        userId: user.id,
                        planId: freePlan.id,
                        status: 'ACTIVE',
                        currentPeriodStart: now,
                        currentPeriodEnd: end,
                    },
                });
            }
        }
        else if (!user.googleId) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { googleId: googleUser.googleId, isEmailVerified: true },
            });
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    async refreshTokens(userId) {
        const tokens = await this.generateTokens(userId, '', '');
        await this.updateRefreshToken(userId, tokens.refreshToken);
        return tokens;
    }
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        return { message: 'Logged out successfully' };
    }
    async verifyEmail(token) {
        const user = await this.prisma.user.findFirst({
            where: { emailVerifyToken: token },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid verification token');
        await this.prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true, emailVerifyToken: null },
        });
        return { message: 'Email verified successfully' };
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user)
            return { message: 'If that email exists, a reset link was sent' };
        const token = (0, uuid_1.v4)();
        const expires = new Date(Date.now() + 3600000);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { resetPasswordToken: token, resetPasswordExpires: expires },
        });
        await this.notificationsService.sendPasswordResetEmail(user.email, token);
        return { message: 'If that email exists, a reset link was sent' };
    }
    async resetPassword(dto) {
        const user = await this.prisma.user.findFirst({
            where: {
                resetPasswordToken: dto.token,
                resetPasswordExpires: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired reset token');
        const hashed = await bcrypt.hash(dto.password, 12);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { password: hashed, resetPasswordToken: null, resetPasswordExpires: null },
        });
        return { message: 'Password reset successfully' };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.password)
            throw new common_1.BadRequestException('Cannot change password for OAuth users');
        const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
        if (!isMatch)
            throw new common_1.BadRequestException('Current password is incorrect');
        const hashed = await bcrypt.hash(dto.newPassword, 12);
        await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
        return { message: 'Password changed successfully' };
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profiles: true,
                subscription: { include: { plan: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { password, refreshToken, emailVerifyToken, resetPasswordToken, ...safe } = user;
        return safe;
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_SECRET'),
                expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
            }),
            this.jwtService.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
            }),
        ]);
        return { accessToken, refreshToken };
    }
    async updateRefreshToken(userId, refreshToken) {
        const hashed = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: hashed } });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService])
], AuthService);
//# sourceMappingURL=auth.service.js.map