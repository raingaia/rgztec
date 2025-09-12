import { Controller, Get, Post, Body } from '@nestjs/common';

@Controller('gift-cards')
export class GiftcardController {
  @Get('health')
  health() {
    return { ok: true, service: 'gift-cards', ts: new Date().toISOString() };
  }

  @Post()
  create(@Body() body: any) {
    // TODO: gerçek iş mantığı (kod üretimi, e-posta, vb)
    return { ok: true, received: body };
  }
}
