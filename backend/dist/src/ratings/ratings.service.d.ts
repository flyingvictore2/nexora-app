import { PrismaService } from '../prisma/prisma.service';
export declare class RatingsService {
    private prisma;
    constructor(prisma: PrismaService);
    rate(userId: string, profileId: string, contentId: string, rating: number, review?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        contentId: string;
        rating: number;
        profileId: string;
        review: string | null;
    }>;
    getForContent(contentId: string, page?: number, limit?: number): Promise<{
        ratings: ({
            profile: {
                id: string;
                name: string;
                avatar: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            contentId: string;
            rating: number;
            profileId: string;
            review: string | null;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getUserRating(profileId: string, contentId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        contentId: string;
        rating: number;
        profileId: string;
        review: string | null;
    } | null>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
