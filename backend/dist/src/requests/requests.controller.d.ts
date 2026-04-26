import { RequestsService } from './requests.service';
export declare class RequestsController {
    private service;
    constructor(service: RequestsService);
    create(user: any, body: {
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
    findMine(user: any): Promise<{
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
    findAll(query: any): Promise<{
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
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }>;
    updateStatus(id: string, body: {
        status: string;
        adminNote?: string;
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
}
