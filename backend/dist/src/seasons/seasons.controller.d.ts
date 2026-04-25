import { SeasonsService, CreateSeasonDto } from './seasons.service';
export declare class SeasonsController {
    private service;
    constructor(service: SeasonsService);
    findByContent(contentId: string): Promise<({
        _count: {
            episodes: number;
        };
        episodes: ({
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
        })[];
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
    })[]>;
    findOne(id: string): Promise<{
        episodes: ({
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
        })[];
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
    }>;
    create(dto: CreateSeasonDto): Promise<{
        number: number;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        posterUrl: string | null;
        releaseYear: number | null;
        contentId: string;
    }>;
    update(id: string, dto: Partial<CreateSeasonDto>): Promise<{
        number: number;
        id: string;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        title: string | null;
        posterUrl: string | null;
        releaseYear: number | null;
        contentId: string;
    }>;
    delete(id: string): Promise<{
        message: string;
    }>;
}
