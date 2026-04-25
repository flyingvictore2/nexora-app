import { PrismaService } from '../prisma/prisma.service';
export declare class AnalyticsService {
    private prisma;
    constructor(prisma: PrismaService);
    getDashboardMetrics(): Promise<{
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
    getRevenueByMonth(months?: number): Promise<{
        month: string;
        revenue: number;
    }[]>;
    getContentByType(): Promise<(import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.ContentGroupByOutputType, "type"[]> & {
        _count: number;
    })[]>;
    getSubscriptionDistribution(): Promise<{
        plan: string;
        count: number;
    }[]>;
    getWatchTimeByDay(days?: number): Promise<{
        date: string;
        totalMinutes: number;
        sessions: number;
    }[]>;
}
