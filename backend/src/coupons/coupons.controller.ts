import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CouponsService } from './coupons.service';

@ApiTags('Coupons')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('coupons')
export class CouponsController {
  constructor(private service: CouponsService) {}

  // Public: validate a coupon code
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  validate(@Body('code') code: string, @Body('amount') amount: number) {
    return this.service.validate(code, amount);
  }

  // Admin only below
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Get()
  findAll() { return this.service.findAll(); }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Post()
  create(@Body() data: any) { return this.service.create(data); }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() data: any) { return this.service.update(id, data); }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
