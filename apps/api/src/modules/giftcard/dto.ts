export class CreateGiftCardDto {
  amount!: number;       // cents
  currency = "USD";
  expiresAt?: string;
  meta?: Record<string, unknown>;
}
export class RedeemGiftCardDto { amount!: number; } // cents
export class TopupGiftCardDto { amount!: number; }  // cents
