import { Module } from "@nestjs/common";
import { GiftcardController } from "./giftcard.controller";
import { GiftcardService } from "./giftcard.service";

@Module({
  controllers: [GiftcardController],
  providers: [GiftcardService]
})
export class GiftcardModule {}

