import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/create-request.dto';
export declare class RequestsController {
    private service;
    constructor(service: RequestsService);
    create(userId: string, dto: CreateRequestDto): Promise<{
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
    findMine(userId: string): Promise<{
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
    getStats(): Promise<{
        total: number;
        pending: number;
        approved: number;
        rejected: number;
    }>;
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
    updateStatus(id: string, dto: UpdateRequestStatusDto): Promise<{
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
