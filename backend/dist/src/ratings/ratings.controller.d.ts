import { RatingsService } from './ratings.service';
export declare class RatingsController {
    private service;
    constructor(service: RatingsService);
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
    getMyRating(profileId: string, contentId: string): Promise<{
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
