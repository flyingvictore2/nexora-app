import { Controller, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private service: AiService) {}

  @Post('chat')
  chat(
    @Body('message') message: string,
    @Body('history') history: { role: 'user' | 'model'; content: string }[] = [],
    @Headers('x-profile-id') profileId?: string,
  ) {
    return this.service.chat(message, history, profileId);
  }
}
