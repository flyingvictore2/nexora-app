import { Module } from '@nestjs/common';
import { WatchHistoryService } from './watch-history.service';
import { WatchHistoryController } from './watch-history.controller';

@Module({
  providers: [WatchHistoryService],
  controllers: [WatchHistoryController],
  exports: [WatchHistoryService],
})
export class WatchHistoryModule {}
