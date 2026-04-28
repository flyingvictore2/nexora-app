import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WatchPartyController } from './watch-party.controller';
import { WatchPartyService } from './watch-party.service';
import { WatchPartyGateway } from './watch-party.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [WatchPartyController],
  providers: [WatchPartyService, WatchPartyGateway],
})
export class WatchPartyModule {}
