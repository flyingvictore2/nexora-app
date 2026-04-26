import { SupportService } from './support.service';
export declare class SupportController {
    private service;
    constructor(service: SupportService);
    create(user: any, body: {
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
    findMine(user: any): Promise<{
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
    findAll(query: any): Promise<{
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
    getStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
    }>;
    reply(id: string, body: {
        adminReply: string;
        status?: string;
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
    updateStatus(id: string, body: {
        status: string;
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
}
