// apps/api/src/modules/delivery/delivery.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly svc: DeliveryService) {}
  @Post('send-giftcard')
  send(@Body() body: { to?: string; code?: string; amount?: number; currency?: string }) {
    return this.svc.enqueueGiftEmail({
      to: String(body?.to ?? ''),
      code: String(body?.code ?? ''),
      amount: Number(body?.amount ?? 0),
      currency: String(body?.currency ?? 'USD'),
    });
  }
}
