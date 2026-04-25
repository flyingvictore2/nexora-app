import { ContentType, SubscriptionPlan } from '@prisma/client';
export declare class CreateContentDto {
    title: string;
    originalTitle?: string;
    description: string;
    type: ContentType;
    posterUrl?: string;
    bannerUrl?: string;
    trailerUrl?: string;
    videoUrl?: string;
    duration?: number;
    releaseYear: number;
    releaseDate?: string;
    genres?: string[];
    cast?: string[];
    director?: string;
    studio?: string;
    country?: string;
    language?: string;
    maturityRating?: string;
    isFeatured?: boolean;
    isTrending?: boolean;
    isNew?: boolean;
    isPublished?: boolean;
    scheduledAt?: string;
    requiredPlan?: SubscriptionPlan;
}
export declare class UpdateContentDto extends CreateContentDto {
}
export declare class ContentQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    type?: ContentType;
    genre?: string;
    language?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isFeatured?: boolean;
    isTrending?: boolean;
}
