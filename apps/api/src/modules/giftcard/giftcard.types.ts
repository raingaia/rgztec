export type GiftCardStatus = "active" | "redeemed" | "void";

export interface GiftCard {
  id: string;
  code: string;
  currency: string;
  initialAmount: number; // cents
  balance: number;       // cents
  status: GiftCardStatus;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  meta?: Record<string, unknown>;
}
