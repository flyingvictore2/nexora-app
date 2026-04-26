import { PrismaService } from '../prisma/prisma.service';
export declare class SupportService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: {
        subject: string;
        message: string;
        category?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        subject: string;
        message: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        adminReply: string | null;
    }>;
    findByUser(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        subject: string;
        message: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        adminReply: string | null;
    }[]>;
    findAll(query: {
        status?: string;
        category?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        tickets: ({
            user: {
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import(".prisma/client").$Enums.TicketStatus;
            subject: string;
            message: string;
            category: import(".prisma/client").$Enums.TicketCategory;
            adminReply: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    reply(id: string, adminReply: string, status?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        subject: string;
        message: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        adminReply: string | null;
    }>;
    updateStatus(id: string, status: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.TicketStatus;
        subject: string;
        message: string;
        category: import(".prisma/client").$Enums.TicketCategory;
        adminReply: string | null;
    }>;
    getStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
    }>;
}
