import { Controller, Get, Post, Patch, Body, Query, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';
import { RequestsService } from './requests.service';
import { CreateRequestDto, UpdateRequestStatusDto } from './dto/create-request.dto';

@ApiTags('Requests')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private service: RequestsService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateRequestDto) {
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

  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  updateStatus(@Param('id') id: string, @Body() dto: UpdateRequestStatusDto) {
    return this.service.updateStatus(id, dto.status, dto.adminNote);
  }
}
