import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { GiftcardService } from "./giftcard.service";

@Controller("gift-cards")
export class GiftcardController {
  constructor(private readonly svc: GiftcardService) {}

  @Post("issue")
  issue(@Body() b: { amount: number; currency?: "USD"|"EUR"|"GBP" }) {
    const amt = Math.max(1, Number(b?.amount ?? 0));
    const cur = (b?.currency ?? "USD") as "USD"|"EUR"|"GBP";
    return this.svc.issue(amt, cur);
  }

  @Get("verify/:code")
  verify(@Param("code") code: string) {
    const c = this.svc.verify(code);
    return c ? { code: c.code, status: c.status, remaining: c.remaining, currency: c.currency } : { error: "not_found" };
  }

  @Post("redeem")
  redeem(@Body() b: { code: string; amount: number }) {
    const c = this.svc.redeem(String(b?.code ?? ""), Number(b?.amount ?? 0));
    return c ?? { error: "cannot_redeem" };
  }
}

