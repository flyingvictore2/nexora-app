import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
export declare class PaymentsService {
    private config;
    private prisma;
    private notifications;
    private stripe;
    private readonly logger;
    constructor(config: ConfigService, prisma: PrismaService, notifications: NotificationsService);
    createCheckoutSession(userId: string, planId: string): Promise<{
        sessionId: string;
        url: string | null;
    }>;
    createPortalSession(userId: string): Promise<{
        url: string;
    }>;
    handleWebhook(payload: Buffer, signature: string): Promise<{
        received: boolean;
    }>;
    private handleCheckoutCompleted;
    private handleInvoicePaymentSucceeded;
    private handleInvoicePaymentFailed;
    private handleSubscriptionUpdated;
    private handleSubscriptionDeleted;
    getPaymentHistory(userId: string, page?: number, limit?: number): Promise<{
        payments: {
            id: string;
            currency: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import(".prisma/client").$Enums.PaymentStatus;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            amount: number;
            stripePaymentId: string | null;
            stripeInvoiceId: string | null;
        }[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    verifyStripeSession(sessionId: string, userId: string): Promise<{
        alreadyProcessed: boolean;
        success?: undefined;
        planName?: undefined;
    } | {
        success: boolean;
        planName: string;
        alreadyProcessed?: undefined;
    }>;
    private get paypalBase();
    private getPayPalAccessToken;
    createPayPalOrder(userId: string, planId: string): Promise<{
        orderID: any;
    }>;
    capturePayPalOrder(orderID: string, userId: string, planId: string): Promise<{
        success: boolean;
        planName: string;
    }>;
    getRevenueStats(): Promise<{
        total: number;
        thisMonth: number;
        thisYear: number;
        totalTransactions: number;
    }>;
}
