import { Module } from '@nestjs/common';
import { VideoSourcesService } from './video-sources.service';
import { VideoSourcesController } from './video-sources.controller';

@Module({
  controllers: [VideoSourcesController],
  providers: [VideoSourcesService],
  exports: [VideoSourcesService],
})
export class VideoSourcesModule {}
