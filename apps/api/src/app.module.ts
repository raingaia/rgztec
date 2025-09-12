import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { GiftcardModule } from './modules/giftcard/giftcard.module';

@Module({
  imports: [HealthModule, GiftcardModule],
})
export class AppModule {}

