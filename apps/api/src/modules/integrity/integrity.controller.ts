import { Controller, Get, Query } from '@nestjs/common';
import { createHash } from 'crypto';

@Controller('integrity')
export class IntegrityController {
  @Get('sha256')
  sha256(@Query('q') q: string) {
    if (!q) return { ok: false, error: 'missing_q' };
    const hash = createHash('sha256').update(q).digest('hex');
    return { ok: true, sha256: hash };
  }
}
