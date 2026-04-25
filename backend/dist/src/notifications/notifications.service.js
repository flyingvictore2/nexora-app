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
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nodemailer = require("nodemailer");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
        this.logger = new common_1.Logger(NotificationsService_1.name);
        this.transporter = nodemailer.createTransport({
            host: config.get('SMTP_HOST', 'smtp.gmail.com'),
            port: config.get('SMTP_PORT', 587),
            secure: false,
            auth: {
                user: config.get('SMTP_USER'),
                pass: config.get('SMTP_PASS'),
            },
        });
    }
    async sendVerificationEmail(email, token) {
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
        const verifyUrl = `${frontendUrl}/auth/verify-email?token=${token}`;
        await this.sendEmail({
            to: email,
            subject: '🎬 Verifica tu email — Nexora',
            html: this.buildEmailTemplate('Verifica tu email', `
        <p>Bienvenido a <strong>Nexora</strong>, la plataforma de streaming definitiva.</p>
        <p>Haz clic en el botón para verificar tu cuenta:</p>
        <a href="${verifyUrl}" style="display:inline-block;padding:14px 28px;background:#e50914;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">
          Verificar Email
        </a>
        <p style="margin-top:16px;color:#999;font-size:12px;">Si no creaste esta cuenta, ignora este mensaje.</p>
      `),
        });
    }
    async sendPasswordResetEmail(email, token) {
        const frontendUrl = this.config.get('FRONTEND_URL', 'http://localhost:3000');
        const resetUrl = `${frontendUrl}/auth/reset-password?token=${token}`;
        await this.sendEmail({
            to: email,
            subject: '🔐 Restablecer contraseña — Nexora',
            html: this.buildEmailTemplate('Restablecer contraseña', `
        <p>Recibimos una solicitud para restablecer tu contraseña de <strong>Nexora</strong>.</p>
        <p>Este enlace expira en <strong>1 hora</strong>.</p>
        <a href="${resetUrl}" style="display:inline-block;padding:14px 28px;background:#e50914;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">
          Restablecer Contraseña
        </a>
        <p style="margin-top:16px;color:#999;font-size:12px;">Si no solicitaste esto, ignora este mensaje.</p>
      `),
        });
    }
    async sendSubscriptionConfirmEmail(email, planName) {
        await this.sendEmail({
            to: email,
            subject: `✅ Suscripción ${planName} activada — Nexora`,
            html: this.buildEmailTemplate('¡Suscripción activada!', `
        <p>Tu suscripción al plan <strong>${planName}</strong> está activa.</p>
        <p>Disfruta de todo el contenido premium de <strong>Nexora</strong>.</p>
        <a href="${this.config.get('FRONTEND_URL', 'http://localhost:3000')}" style="display:inline-block;padding:14px 28px;background:#e50914;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;">
          Ir a Nexora
        </a>
      `),
        });
    }
    async createInAppNotification(userId, title, message, type, metadata) {
        return this.prisma.notification.create({
            data: { userId, title, message, type, metadata },
        });
    }
    async getUserNotifications(userId) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async markAsRead(notificationId, userId) {
        return this.prisma.notification.updateMany({
            where: { id: notificationId, userId },
            data: { isRead: true },
        });
    }
    async markAllAsRead(userId) {
        return this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }
    async getUnreadCount(userId) {
        return this.prisma.notification.count({ where: { userId, isRead: false } });
    }
    async deleteNotification(notificationId, userId) {
        await this.prisma.notification.deleteMany({ where: { id: notificationId, userId } });
        return { message: 'Notification deleted' };
    }
    async sendEmail(options) {
        try {
            await this.transporter.sendMail({
                from: `"Nexora" <${this.config.get('EMAIL_FROM', 'noreply@nexora.com')}>`,
                ...options,
            });
        }
        catch (error) {
            this.logger.warn(`Failed to send email to ${options.to}: ${error.message}`);
        }
    }
    buildEmailTemplate(title, content) {
        return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0;padding:0;background:#141414;font-family:Arial,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#1a1a1a;border-radius:8px;overflow:hidden;">
          <div style="background:#e50914;padding:24px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:4px;">NEXORA</h1>
          </div>
          <div style="padding:40px;color:#fff;">
            <h2 style="margin-top:0;color:#fff;">${title}</h2>
            ${content}
          </div>
          <div style="padding:20px;text-align:center;color:#666;font-size:12px;border-top:1px solid #333;">
            © ${new Date().getFullYear()} Nexora. Todos los derechos reservados.
          </div>
        </div>
      </body>
      </html>
    `;
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map