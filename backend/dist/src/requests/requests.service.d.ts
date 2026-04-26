import { PrismaService } from '../prisma/prisma.service';
export declare class RequestsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: {
        title: string;
        type: string;
        description?: string;
    }): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        title: string;
        type: import(".prisma/client").$Enums.RequestType;
        adminNote: string | null;
    }>;
    findByUser(userId: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        title: string;
        type: import(".prisma/client").$Enums.RequestType;
        adminNote: string | null;
    }[]>;
    findAll(query: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        requests: ({
            user: {
                email: string;
            };
        } & {
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            status: import(".prisma/client").$Enums.RequestStatus;
            title: string;
            type: import(".prisma/client").$Enums.RequestType;
            adminNote: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    updateStatus(id: string, status: string, adminNote?: string): Promise<{
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        status: import(".prisma/client").$Enums.RequestStatus;
        title: string;
        type: import(".prisma/client").$Enums.RequestType;
        adminNote: string | null;
    }>;
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }>;
}
