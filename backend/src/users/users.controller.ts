import { Controller, Get, Put, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private service: UsersService) {}

  @Get()
  @Roles(Role.ADMIN)
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string) {
    return this.service.findAll(+page, +limit, search);
  }

  @Get('stats')
  @Roles(Role.ADMIN)
  getStats() {
    return this.service.getStats();
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/block')
  @Roles(Role.ADMIN)
  block(@Param('id') id: string) {
    return this.service.block(id);
  }

  @Patch(':id/unblock')
  @Roles(Role.ADMIN)
  unblock(@Param('id') id: string) {
    return this.service.unblock(id);
  }

  @Get(':id/activity')
  @Roles(Role.ADMIN)
  getActivity(@Param('id') id: string) {
    return this.service.getActivity(id);
  }
}
