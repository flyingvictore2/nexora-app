import { Controller, Get, Post, Put, Delete, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('Subscriptions')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private service: SubscriptionsService) {}

  @Get('plans')
  @Public()
  getPlans() {
    return this.service.getPlans();
  }

  @Get('plans/all')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getAllPlans() {
    return this.service.getAllPlans();
  }

  @Get('plans/:id')
  @Public()
  getPlan(@Param('id') id: string) {
    return this.service.getPlanById(id);
  }

  @Get('my')
  getUserSubscription(@CurrentUser('id') userId: string) {
    return this.service.getUserSubscription(userId);
  }

  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  cancel(@CurrentUser('id') userId: string) {
    return this.service.cancelSubscription(userId);
  }

  @Post('plans')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  createPlan(@Body() dto: any) {
    return this.service.createPlan(dto);
  }

  @Put('plans/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updatePlan(@Param('id') id: string, @Body() dto: any) {
    return this.service.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  deletePlan(@Param('id') id: string) {
    return this.service.deletePlan(id);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getStats() {
    return this.service.getSubscriptionStats();
  }
}
