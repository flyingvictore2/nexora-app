import { Controller, Get, Param, Query, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { RecommendationsService } from './recommendations.service';

@ApiTags('Recommendations')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('recommendations')
export class RecommendationsController {
  constructor(private service: RecommendationsService) {}

  @Get()
  getForProfile(@Headers('x-profile-id') profileId: string) {
    return this.service.getForProfile(profileId);
  }

  @Get('similar/:contentId')
  @Public()
  getSimilar(@Param('contentId') contentId: string) {
    return this.service.getSimilar(contentId);
  }

  @Get('top-rated')
  @Public()
  getTopRated(@Query('type') type?: string) {
    return this.service.getTopRated(type);
  }
}
