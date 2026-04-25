import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AnalyticsService } from '../analytics/analytics.service';
import { UsersService } from '../users/users.service';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { PaymentsService } from '../payments/payments.service';

@ApiTags('Admin')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private analytics: AnalyticsService,
    private users: UsersService,
    private subscriptions: SubscriptionsService,
    private payments: PaymentsService,
  ) {}

  @Get('dashboard')
  async getDashboard() {
    const [metrics, mostWatched, userGrowth, revenue, subscriptionDist] = await Promise.all([
      this.analytics.getDashboardMetrics(),
      this.analytics.getMostWatched(10),
      this.analytics.getUserGrowth(6),
      this.analytics.getRevenueByMonth(6),
      this.analytics.getSubscriptionDistribution(),
    ]);

    return { metrics, mostWatched, userGrowth, revenue, subscriptionDist };
  }
}
