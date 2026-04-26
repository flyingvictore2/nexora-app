import { SupportService } from './support.service';
import { CreateTicketDto, ReplyTicketDto, UpdateTicketStatusDto } from './dto/create-ticket.dto';
export declare class SupportController {
    private service;
    constructor(service: SupportService);
    create(userId: string, dto: CreateTicketDto): Promise<{
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
    findMine(userId: string): Promise<{
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
    getStats(): Promise<{
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
    }>;
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
    reply(id: string, dto: ReplyTicketDto): Promise<{
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
    updateStatus(id: string, dto: UpdateTicketStatusDto): Promise<{
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
