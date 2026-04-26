import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { SupportService } from './support.service';

@ApiTags('Support')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private service: SupportService) {}

  // User: create ticket
  @Post()
  create(@CurrentUser() user: any, @Body() body: { subject: string; message: string; category?: string }) {
    return this.service.create(user.id, body);
  }

  // User: view own tickets
  @Get('my')
  findMine(@CurrentUser() user: any) {
    return this.service.findByUser(user.id);
  }

  // Admin: view all tickets
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  // Admin: stats
  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getStats() {
    return this.service.getStats();
  }

  // Admin: reply to ticket
  @Patch(':id/reply')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  reply(@Param('id') id: string, @Body() body: { adminReply: string; status?: string }) {
    return this.service.reply(id, body.adminReply, body.status);
  }

  // Admin: update status
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.service.updateStatus(id, body.status);
  }
}
