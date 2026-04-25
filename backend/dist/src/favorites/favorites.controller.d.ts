import { FavoritesService } from './favorites.service';
export declare class FavoritesController {
    private service;
    constructor(service: FavoritesService);
    getAll(profileId: string, page?: number, limit?: number): Promise<{
        favorites: ({
            content: {
                id: string;
                title: string;
                type: import(".prisma/client").$Enums.ContentType;
                posterUrl: string | null;
                bannerUrl: string | null;
                duration: number | null;
                releaseYear: number;
                genres: string[];
                averageRating: number;
            };
        } & {
            id: string;
            createdAt: Date;
            contentId: string;
            profileId: string;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    toggle(profileId: string, contentId: string): Promise<{
        added: boolean;
        message: string;
    }>;
    check(profileId: string, contentId: string): Promise<{
        isFavorite: boolean;
    }>;
}
