// apps/api/src/modules/delivery/delivery.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class DeliveryService {
  enqueueGiftEmail(payload: { to: string; code: string; amount: number; currency: string }) {
    // demo: pretend to enqueue
    return { queued: true, payload, id: Math.random().toString(36).slice(2) };
  }
}
