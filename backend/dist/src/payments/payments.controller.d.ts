import { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private service;
    constructor(service: PaymentsService);
    createCheckout(userId: string, planId: string): Promise<{
        sessionId: string;
        url: string | null;
    }>;
    verifyStripeSession(userId: string, sessionId: string): Promise<{
        alreadyProcessed: boolean;
        success?: undefined;
        planName?: undefined;
    } | {
        success: boolean;
        planName: string;
        alreadyProcessed?: undefined;
    }>;
    createPayPalOrder(userId: string, planId: string): Promise<{
        orderID: any;
    }>;
    capturePayPalOrder(userId: string, orderID: string, planId: string): Promise<{
        success: boolean;
        planName: string;
    }>;
    createPortal(userId: string): Promise<{
        url: string;
    }>;
    getHistory(userId: string, page?: number, limit?: number): Promise<{
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
    getRevenue(): Promise<{
        total: number;
        thisMonth: number;
        thisYear: number;
        totalTransactions: number;
    }>;
    webhook(req: RawBodyRequest<Request>, signature: string): Promise<{
        received: boolean;
    }>;
}
