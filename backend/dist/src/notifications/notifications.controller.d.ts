import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private service;
    constructor(service: NotificationsService);
    getAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        title: string;
        type: string;
        message: string;
        isRead: boolean;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    getUnreadCount(userId: string): Promise<number>;
    markAllRead(userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    markRead(id: string, userId: string): Promise<import(".prisma/client").Prisma.BatchPayload>;
    deleteOne(id: string, userId: string): Promise<{
        message: string;
    }>;
}
