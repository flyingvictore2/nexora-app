import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PaymentsService } from './payments.service';

@ApiTags('Payments')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private service: PaymentsService) {}

  @Post('checkout')
  @HttpCode(HttpStatus.OK)
  createCheckout(@CurrentUser('id') userId: string, @Body('planId') planId: string) {
    return this.service.createCheckoutSession(userId, planId);
  }

  @Post('stripe/verify-session')
  @HttpCode(HttpStatus.OK)
  verifyStripeSession(
    @CurrentUser('id') userId: string,
    @Body('sessionId') sessionId: string,
  ) {
    return this.service.verifyStripeSession(sessionId, userId);
  }

  @Post('paypal/create-order')
  @HttpCode(HttpStatus.OK)
  createPayPalOrder(@CurrentUser('id') userId: string, @Body('planId') planId: string) {
    return this.service.createPayPalOrder(userId, planId);
  }

  @Post('paypal/capture')
  @HttpCode(HttpStatus.OK)
  capturePayPalOrder(
    @CurrentUser('id') userId: string,
    @Body('orderID') orderID: string,
    @Body('planId') planId: string,
  ) {
    return this.service.capturePayPalOrder(orderID, userId, planId);
  }

  @Post('portal')
  @HttpCode(HttpStatus.OK)
  createPortal(@CurrentUser('id') userId: string) {
    return this.service.createPortalSession(userId);
  }

  @Get('history')
  getHistory(
    @CurrentUser('id') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.service.getPaymentHistory(userId, +page, +limit);
  }

  @Get('revenue')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getRevenue() {
    return this.service.getRevenueStats();
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async webhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.service.handleWebhook(req.rawBody as Buffer, signature);
  }
}
