import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProfilesModule } from './profiles/profiles.module';
import { ContentModule } from './content/content.module';
import { SeasonsModule } from './seasons/seasons.module';
import { EpisodesModule } from './episodes/episodes.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { PaymentsModule } from './payments/payments.module';
import { WatchHistoryModule } from './watch-history/watch-history.module';
import { RatingsModule } from './ratings/ratings.module';
import { FavoritesModule } from './favorites/favorites.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AdminModule } from './admin/admin.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { UploadsModule } from './uploads/uploads.module';
import { HealthModule } from './health/health.module';
import { RequestsModule } from './requests/requests.module';
import { SupportModule } from './support/support.module';
import { SettingsModule } from './settings/settings.module';
import { ListsModule } from './lists/lists.module';
import { AiModule } from './ai/ai.module';
import { FriendsModule } from './friends/friends.module';
import { WatchPartyModule } from './watch-party/watch-party.module';
import { CouponsModule } from './coupons/coupons.module';
import { VideoSourcesModule } from './video-sources/video-sources.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: () => [{ ttl: 60000, limit: 100 }],
    }),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    ContentModule,
    SeasonsModule,
    EpisodesModule,
    SubscriptionsModule,
    PaymentsModule,
    WatchHistoryModule,
    RatingsModule,
    FavoritesModule,
    RecommendationsModule,
    AdminModule,
    AnalyticsModule,
    NotificationsModule,
    UploadsModule,
    HealthModule,
    RequestsModule,
    SupportModule,
    SettingsModule,
    ListsModule,
    AiModule,
    FriendsModule,
    WatchPartyModule,
    CouponsModule,
    VideoSourcesModule,
  ],
})
export class AppModule {}
