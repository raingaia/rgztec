import { Module } from '@nestjs/common';
import { GiftcardController } from './giftcard.controller';

@Module({
  controllers: [GiftcardController],
})
export class GiftcardModule {}

