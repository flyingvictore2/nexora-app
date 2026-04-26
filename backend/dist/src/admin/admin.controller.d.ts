import { AnalyticsService } from '../analytics/analytics.service';
import { UsersService } from '../users/users.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { PaymentsService } from '../payments/payments.service';
export declare class AdminController {
    private analytics;
    private users;
    private subscriptions;
    private payments;
    constructor(analytics: AnalyticsService, users: UsersService, subscriptions: SubscriptionsService, payments: PaymentsService);
    getDashboard(): Promise<{
        metrics: {
            totalUsers: number;
            newUsersThisMonth: number;
            activeSubscriptions: number;
            totalContent: number;
            totalRevenue: number;
            monthRevenue: number;
            totalWatchTimeHours: number;
        };
        mostWatched: {
            id: string;
            title: string;
            type: import(".prisma/client").$Enums.ContentType;
            posterUrl: string | null;
            averageRating: number;
            totalViews: number;
            _count: {
                ratings: number;
            };
        }[];
        userGrowth: {
            month: string;
            users: number;
        }[];
        revenue: {
            month: string;
            revenue: number;
        }[];
        subscriptionDist: {
            plan: string;
            count: number;
        }[];
    }>;
}
