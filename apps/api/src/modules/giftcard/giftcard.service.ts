import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { CreateGiftCardDto, RedeemGiftCardDto, TopupGiftCardDto } from "./dto";
import { GiftCard } from "./giftcard.types";
import crypto from "crypto";

const now = () => new Date().toISOString();
const code = () => {
  const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const pick = (n: number) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return `RGZ-${pick(4)}-${pick(4)}`;
};

@Injectable()
export class GiftCardService {
  private store = new Map<string, GiftCard>(); // key: code

  create(dto: CreateGiftCardDto): GiftCard {
    if (!dto.amount || dto.amount <= 0) throw new BadRequestException("amount must be > 0");
    const gc: GiftCard = {
      id: crypto.randomUUID(),
      code: code(),
      currency: dto.currency || "USD",
      initialAmount: dto.amount,
      balance: dto.amount,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
      expiresAt: dto.expiresAt ?? null,
      meta: dto.meta ?? {}
    };
    this.store.set(gc.code, gc);
    return gc;
  }

  getByCode(c: string): GiftCard {
    const gc = this.store.get(c);
    if (!gc) throw new NotFoundException("gift card not found");
    return gc;
  }

  redeem(c: string, dto: RedeemGiftCardDto): GiftCard {
    const gc = this.getByCode(c);
    if (gc.status !== "active") throw new BadRequestException("gift card not active");
    if (gc.expiresAt && new Date(gc.expiresAt) < new Date()) throw new BadRequestException("gift card expired");
    if (!dto.amount || dto.amount <= 0) throw new BadRequestException("amount must be > 0");
    if (gc.balance < dto.amount) throw new BadRequestException("insufficient balance");
    gc.balance -= dto.amount;
    gc.updatedAt = now();
    if (gc.balance === 0) gc.status = "redeemed";
    this.store.set(gc.code, gc);
    return gc;
  }

  topup(c: string, dto: TopupGiftCardDto): GiftCard {
    const gc = this.getByCode(c);
    if (gc.status === "void") throw new BadRequestException("gift card void");
    if (!dto.amount || dto.amount <= 0) throw new BadRequestException("amount must be > 0");
    gc.balance += dto.amount;
    gc.updatedAt = now();
    if (gc.status === "redeemed" && gc.balance > 0) gc.status = "active";
    this.store.set(gc.code, gc);
    return gc;
  }

  void(c: string): GiftCard {
    const gc = this.getByCode(c);
    gc.status = "void";
    gc.updatedAt = now();
    this.store.set(gc.code, gc);
    return gc;
  }
}
