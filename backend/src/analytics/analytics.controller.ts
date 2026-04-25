import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('Analytics')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('analytics')
export class AnalyticsController {
  constructor(private service: AnalyticsService) {}

  @Get('dashboard')
  getDashboard() {
    return this.service.getDashboardMetrics();
  }

  @Get('most-watched')
  getMostWatched(@Query('limit') limit = 10, @Query('type') type?: string) {
    return this.service.getMostWatched(+limit, type);
  }

  @Get('user-growth')
  getUserGrowth(@Query('months') months = 6) {
    return this.service.getUserGrowth(+months);
  }

  @Get('revenue')
  getRevenue(@Query('months') months = 6) {
    return this.service.getRevenueByMonth(+months);
  }

  @Get('content-types')
  getContentTypes() {
    return this.service.getContentByType();
  }

  @Get('subscriptions')
  getSubscriptions() {
    return this.service.getSubscriptionDistribution();
  }

  @Get('watch-time')
  getWatchTime(@Query('days') days = 7) {
    return this.service.getWatchTimeByDay(+days);
  }
}
