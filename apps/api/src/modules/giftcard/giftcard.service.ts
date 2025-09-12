import { Injectable } from '@nestjs/common';

type Card = {
  code: string;
  currency: 'USD'|'EUR'|'GBP';
  amount: number;          // original
  remaining: number;       // remaining
  status: 'active'|'redeemed'|'void';
};

const mem = new Map<string, Card>();

@Injectable()
export class GiftcardService {
  issue(amount: number, currency: Card['currency']) {
    const code = this.code();
    const card: Card = { code, amount, remaining: amount, currency, status: 'active' };
    mem.set(code, card);
    return card;
  }

  verify(code: string) {
    const card = mem.get(code);
    if (!card) return null;
    return card;
  }

  redeem(code: string, useAmount: number) {
    const card = mem.get(code);
    if (!card || card.status !== 'active') return null;
    if (useAmount <= 0 || useAmount > card.remaining) return null;
    card.remaining -= useAmount;
    if (card.remaining === 0) card.status = 'redeemed';
    mem.set(code, card);
    return card;
  }

  private code() {
    const s='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const pick=(n:number)=>Array.from({length:n},()=>s[Math.floor(Math.random()*s.length)]).join('');
    return `RGZ-${pick(4)}-${pick(4)}`;
  }
}
