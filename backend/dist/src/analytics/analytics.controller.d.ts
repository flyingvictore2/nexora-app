import { AnalyticsService } from './analytics.service';
export declare class AnalyticsController {
    private service;
    constructor(service: AnalyticsService);
    getDashboard(): Promise<{
        totalUsers: number;
        newUsersThisMonth: number;
        activeSubscriptions: number;
        totalContent: number;
        totalRevenue: number;
        monthRevenue: number;
        totalWatchTimeHours: number;
    }>;
    getMostWatched(limit?: number, type?: string): Promise<{
        id: string;
        title: string;
        type: import(".prisma/client").$Enums.ContentType;
        posterUrl: string | null;
        averageRating: number;
        totalViews: number;
        _count: {
            ratings: number;
        };
    }[]>;
    getUserGrowth(months?: number): Promise<{
        month: string;
        users: number;
    }[]>;
    getRevenue(months?: number): Promise<{
        month: string;
        revenue: number;
    }[]>;
    getContentTypes(): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ContentGroupByOutputType, "type"[]> & {
        _count: number;
    })[]>;
    getSubscriptions(): Promise<{
        plan: string;
        count: number;
    }[]>;
    getWatchTime(days?: number): Promise<{
        date: string;
        totalMinutes: number;
        sessions: number;
    }[]>;
}
