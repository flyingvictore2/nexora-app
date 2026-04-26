import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { SupportService } from './support.service';
import { CreateTicketDto, ReplyTicketDto, UpdateTicketStatusDto } from './dto/create-ticket.dto';

@ApiTags('Support')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('support')
export class SupportController {
  constructor(private service: SupportService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTicketDto) {
    return this.service.create(userId, dto);
  }

  @Get('my')
  findMine(@CurrentUser('id') userId: string) {
    return this.service.findByUser(userId);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  getStats() {
    return this.service.getStats();
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Patch(':id/reply')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  reply(@Param('id') id: string, @Body() dto: ReplyTicketDto) {
    return this.service.reply(id, dto.adminReply, dto.status);
  }

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTicketStatusDto) {
    return this.service.updateStatus(id, dto.status);
  }
}
