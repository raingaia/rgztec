import { Injectable } from "@nestjs/common";

type Card = {
  code: string;
  currency: "USD"|"EUR"|"GBP";
  amount: number;
  remaining: number;
  status: "active"|"redeemed"|"void";
  createdAt: string;
};

const mem = new Map<string, Card>();

@Injectable()
export class GiftcardService {
  issue(amount: number, currency: Card["currency"]) {
    const code = this.code();
    const card: Card = {
      code, currency,
      amount, remaining: amount,
      status: "active",
      createdAt: new Date().toISOString()
    };
    mem.set(code, card);
    return card;
  }

  verify(code: string) { return mem.get(code) ?? null; }

  redeem(code: string, useAmount: number) {
    const c = mem.get(code);
    if (!c || c.status !== "active") return null;
    if (useAmount <= 0 || useAmount > c.remaining) return null;
    c.remaining -= useAmount;
    if (c.remaining === 0) c.status = "redeemed";
    mem.set(code, c);
    return c;
  }

  private code() {
    const s = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const pick = (n: number) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
    return `RGZ-${pick(4)}-${pick(4)}`;
  }
}
