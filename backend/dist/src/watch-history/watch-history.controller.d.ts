import { WatchHistoryService, UpdateProgressDto } from './watch-history.service';
export declare class WatchHistoryController {
    private service;
    constructor(service: WatchHistoryService);
    updateProgress(userId: string, dto: UpdateProgressDto): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        duration: number;
        contentId: string;
        episodeId: string | null;
        profileId: string;
        progress: number;
        completed: boolean;
        watchedAt: Date;
    }>;
    getHistory(profileId: string, page?: number, limit?: number): Promise<{
        history: ({
            content: {
                id: string;
                title: string;
                type: import(".prisma/client").$Enums.ContentType;
                posterUrl: string | null;
                duration: number | null;
            };
            episode: {
                number: number;
                id: string;
                title: string;
                season: {
                    number: number;
                };
            } | null;
        } & {
            id: string;
            updatedAt: Date;
            userId: string;
            duration: number;
            contentId: string;
            episodeId: string | null;
            profileId: string;
            progress: number;
            completed: boolean;
            watchedAt: Date;
        })[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    getContinueWatching(profileId: string): Promise<({
        content: {
            id: string;
            title: string;
            type: import(".prisma/client").$Enums.ContentType;
            posterUrl: string | null;
            bannerUrl: string | null;
            duration: number | null;
            _count: {
                seasons: number;
            };
        };
        episode: {
            number: number;
            id: string;
            title: string;
            duration: number | null;
            season: {
                number: number;
                contentId: string;
            };
            thumbnailUrl: string | null;
        } | null;
    } & {
        id: string;
        updatedAt: Date;
        userId: string;
        duration: number;
        contentId: string;
        episodeId: string | null;
        profileId: string;
        progress: number;
        completed: boolean;
        watchedAt: Date;
    })[]>;
    getProgress(profileId: string, contentId: string, episodeId?: string): Promise<{
        id: string;
        updatedAt: Date;
        userId: string;
        duration: number;
        contentId: string;
        episodeId: string | null;
        profileId: string;
        progress: number;
        completed: boolean;
        watchedAt: Date;
    } | null>;
    deleteItem(id: string, userId: string): Promise<{
        message: string;
    }>;
    clearHistory(profileId: string, userId: string): Promise<{
        message: string;
    }>;
}
