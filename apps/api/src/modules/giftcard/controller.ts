import { Controller, Get, Param, Post, Body } from "@nestjs/common";
import { GiftCardService } from "./giftcard.service";
import { CreateGiftCardDto, RedeemGiftCardDto, TopupGiftCardDto } from "./dto";

@Controller("gift-cards")
export class GiftCardController {
  constructor(private svc: GiftCardService) {}

  @Post()
  create(@Body() dto: CreateGiftCardDto) { return this.svc.create(dto); }

  @Get(":code")
  get(@Param("code") code: string) { return this.svc.getByCode(code); }

  @Post(":code/redeem")
  redeem(@Param("code") code: string, @Body() dto: RedeemGiftCardDto) {
    return this.svc.redeem(code, dto);
  }

  @Post(":code/topup")
  topup(@Param("code") code: string, @Body() dto: TopupGiftCardDto) {
    return this.svc.topup(code, dto);
  }

  @Post(":code/void")
  void(@Param("code") code: string) { return this.svc.void(code); }
}
