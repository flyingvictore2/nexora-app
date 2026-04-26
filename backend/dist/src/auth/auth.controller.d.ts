import { ConfigService } from '@nestjs/config';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, VerifyEmailDto, ChangePasswordDto } from './dto/register.dto';
export declare class AuthController {
    private authService;
    private config;
    constructor(authService: AuthService, config: ConfigService);
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
    refresh(req: Request): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
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
    googleAuth(): void;
    googleCallback(req: Request, res: Response): Promise<void>;
}
