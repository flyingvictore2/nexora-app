import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationsService {
    private config;
    private prisma;
    private readonly logger;
    private transporter;
    constructor(config: ConfigService, prisma: PrismaService);
    sendVerificationEmail(email: string, token: string): Promise<void>;
    sendPasswordResetEmail(email: string, token: string): Promise<void>;
    sendSubscriptionConfirmEmail(email: string, planName: string): Promise<void>;
    createInAppNotification(userId: string, title: string, message: string, type: string, metadata?: any): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: string;
        message: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    getUserNotifications(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: string;
        message: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    markAsRead(notificationId: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markAllAsRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    getUnreadCount(userId: string): Promise<number>;
    deleteNotification(notificationId: string, userId: string): Promise<{
        message: string;
    }>;
    private sendEmail;
    private buildEmailTemplate;
}
