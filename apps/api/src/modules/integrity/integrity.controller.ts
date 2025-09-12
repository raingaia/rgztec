// apps/api/src/modules/integrity/integrity.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { IntegrityService } from './integrity.service';

@Controller('integrity')
export class IntegrityController {
  constructor(private readonly svc: IntegrityService) {}
  @Get('sha256')
  sha(@Query('q') q = '') { return { q, sha256: this.svc.sha256(q) }; }
}
