import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private config;
    private notificationsService;
    constructor(prisma: PrismaService, jwtService: JwtService, config: ConfigService, notificationsService: NotificationsService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            googleId: string | null;
            role: import(".prisma/client").$Enums.Role;
            isEmailVerified: boolean;
            resetPasswordToken: string | null;
            resetPasswordExpires: Date | null;
            isBlocked: boolean;
            lastLoginAt: Date | null;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
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
        };
    }>;
    loginGoogle(googleUser: any): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    refreshTokens(userId: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
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
    private generateTokens;
    private updateRefreshToken;
}
