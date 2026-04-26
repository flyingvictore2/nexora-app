import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, limit?: number, search?: string): Promise<{
        users: {
            id: string;
            createdAt: Date;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            isBlocked: boolean;
            lastLoginAt: Date | null;
            profiles: {
                id: string;
                name: string;
                avatar: string | null;
            }[];
            subscription: ({
                plan: {
                    planType: import(".prisma/client").$Enums.SubscriptionPlan;
                    name: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                userId: string;
                planId: string;
                status: import(".prisma/client").$Enums.SubscriptionStatus;
                currentPeriodStart: Date;
                currentPeriodEnd: Date;
                trialStart: Date | null;
                trialEnd: Date | null;
                cancelAtPeriodEnd: boolean;
                stripeSubscriptionId: string | null;
                stripeCustomerId: string | null;
            }) | null;
            _count: {
                watchHistory: number;
            };
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        profiles: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            avatar: string | null;
            isKids: boolean;
            language: string;
            maturityRating: string;
            pin: string | null;
            isDefault: boolean;
            userId: string;
        }[];
        subscription: ({
            plan: {
                id: string;
                planType: import(".prisma/client").$Enums.SubscriptionPlan;
                name: string;
                price: number;
                currency: string;
                description: string | null;
                features: string[];
                maxProfiles: number;
                maxDevices: number;
                videoQuality: string;
                hasDownloads: boolean;
                trialDays: number;
                stripeProductId: string | null;
                stripePriceId: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            planId: string;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            currentPeriodStart: Date;
            currentPeriodEnd: Date;
            trialStart: Date | null;
            trialEnd: Date | null;
            cancelAtPeriodEnd: boolean;
            stripeSubscriptionId: string | null;
            stripeCustomerId: string | null;
        }) | null;
        _count: {
            watchHistory: number;
            ratings: number;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        googleId: string | null;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        resetPasswordExpires: Date | null;
        isBlocked: boolean;
        lastLoginAt: Date | null;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        isEmailVerified: boolean;
        isBlocked: boolean;
    }>;
    block(id: string): Promise<{
        id: string;
        email: string;
        isBlocked: boolean;
    }>;
    unblock(id: string): Promise<{
        id: string;
        email: string;
        isBlocked: boolean;
    }>;
    getActivity(userId: string): Promise<{
        watchHistory: ({
            content: {
                id: string;
                title: string;
                type: import(".prisma/client").$Enums.ContentType;
                posterUrl: string | null;
            };
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
        ratings: ({
            content: {
                id: string;
                title: string;
                posterUrl: string | null;
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
        favorites: ({
            content: {
                id: string;
                title: string;
                type: import(".prisma/client").$Enums.ContentType;
                posterUrl: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            contentId: string;
            profileId: string;
        })[];
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        blocked: number;
        verified: number;
        newThisMonth: number;
    }>;
}
