import { Module } from "@nestjs/common";
import { GiftCardService } from "./giftcard.service";
import { GiftCardController } from "./giftcard.controller";

@Module({
  providers: [GiftCardService],
  controllers: [GiftCardController],
  exports: [GiftCardService]
})
export class GiftCardModule {}
