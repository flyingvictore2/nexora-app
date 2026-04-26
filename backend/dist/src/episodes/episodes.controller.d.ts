import { EpisodesService, CreateEpisodeDto } from './episodes.service';
export declare class EpisodesController {
    private service;
    constructor(service: EpisodesService);
    findBySeason(seasonId: string): Promise<({
        subtitles: {
            id: string;
            language: string;
            contentId: string | null;
            episodeId: string | null;
            label: string;
            url: string;
        }[];
    } & {
        number: number;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        videoUrl: string;
        duration: number | null;
        releaseDate: Date | null;
        isPublished: boolean;
        thumbnailUrl: string | null;
        introStart: number | null;
        introEnd: number | null;
        views: number;
        seasonId: string;
    })[]>;
    findOne(id: string): Promise<{
        subtitles: {
            id: string;
            language: string;
            contentId: string | null;
            episodeId: string | null;
            label: string;
            url: string;
        }[];
        season: {
            content: {
                id: string;
                title: string;
                type: import(".prisma/client").$Enums.ContentType;
            };
        } & {
            number: number;
            id: string;
            description: string | null;
            createdAt: Date;
            updatedAt: Date;
            title: string | null;
            posterUrl: string | null;
            releaseYear: number | null;
            contentId: string;
        };
    } & {
        number: number;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        videoUrl: string;
        duration: number | null;
        releaseDate: Date | null;
        isPublished: boolean;
        thumbnailUrl: string | null;
        introStart: number | null;
        introEnd: number | null;
        views: number;
        seasonId: string;
    }>;
    create(dto: CreateEpisodeDto): Promise<{
        number: number;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        videoUrl: string;
        duration: number | null;
        releaseDate: Date | null;
        isPublished: boolean;
        thumbnailUrl: string | null;
        introStart: number | null;
        introEnd: number | null;
        views: number;
        seasonId: string;
    }>;
    update(id: string, dto: Partial<CreateEpisodeDto>): Promise<{
        number: number;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        videoUrl: string;
        duration: number | null;
        releaseDate: Date | null;
        isPublished: boolean;
        thumbnailUrl: string | null;
        introStart: number | null;
        introEnd: number | null;
        views: number;
        seasonId: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
    addSubtitle(id: string, subtitle: {
        language: string;
        label: string;
        url: string;
    }): Promise<{
        id: string;
        language: string;
        contentId: string | null;
        episodeId: string | null;
        label: string;
        url: string;
    }>;
    removeSubtitle(subtitleId: string): Promise<{
        id: string;
        language: string;
        contentId: string | null;
        episodeId: string | null;
        label: string;
        url: string;
    }>;
    incrementView(id: string): Promise<void>;
}
