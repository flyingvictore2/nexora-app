import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto, UpdateProfileDto } from './dto/profile.dto';
export declare class ProfilesService {
    private prisma;
    private MAX_PROFILES;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        avatar: string | null;
        isKids: boolean;
        language: string;
        maturityRating: string;
        pin: string | null;
        isDefault: boolean;
        userId: string;
    }[]>;
    findOne(id: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        avatar: string | null;
        isKids: boolean;
        language: string;
        maturityRating: string;
        pin: string | null;
        isDefault: boolean;
        userId: string;
    }>;
    create(userId: string, dto: CreateProfileDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        avatar: string | null;
        isKids: boolean;
        language: string;
        maturityRating: string;
        pin: string | null;
        isDefault: boolean;
        userId: string;
    }>;
    update(id: string, userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        avatar: string | null;
        isKids: boolean;
        language: string;
        maturityRating: string;
        pin: string | null;
        isDefault: boolean;
        userId: string;
    }>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
    setDefault(id: string, userId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        avatar: string | null;
        isKids: boolean;
        language: string;
        maturityRating: string;
        pin: string | null;
        isDefault: boolean;
        userId: string;
    }>;
    verifyPin(id: string, userId: string, pin: string): Promise<{
        valid: boolean;
    }>;
}
