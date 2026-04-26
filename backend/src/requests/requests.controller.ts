import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { RequestsService } from './requests.service';

@ApiTags('Requests')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private service: RequestsService) {}

  // User: submit a request
  @Post()
  create(@CurrentUser() user: any, @Body() body: { title: string; type: string; description?: string }) {
    return this.service.create(user.id, body);
  }

  // User: view own requests
  @Get('my')
  findMine(@CurrentUser() user: any) {
    return this.service.findByUser(user.id);
  }

  // Admin: view all requests
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

  // Admin: approve/reject
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() body: { status: string; adminNote?: string }) {
    return this.service.updateStatus(id, body.status, body.adminNote);
  }
}
