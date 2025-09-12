// apps/api/src/modules/packager/packager.controller.ts
import { Controller, Get } from '@nestjs/common';
import { PackagerService } from './packager.service';

@Controller('packager')
export class PackagerController {
  constructor(private readonly svc: PackagerService) {}
  @Get('health') health() { return this.svc.ping(); }
}
