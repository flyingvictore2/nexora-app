import { Controller, Post, Body, Headers, UseGuards, Logger, InternalServerErrorException } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AiService } from './ai.service';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(private service: AiService) {}

  @Post('chat')
  async chat(
    @Body('message') message: string,
    @Body('history') history: { role: 'user' | 'model'; content: string }[] = [],
    @Headers('x-profile-id') profileId?: string,
  ) {
    try {
      return await this.service.chat(message, history ?? [], profileId);
    } catch (err: any) {
      this.logger.error('Gemini chat error:', err?.message ?? err);
      throw new InternalServerErrorException(err?.message ?? 'AI error');
    }
  }
}
