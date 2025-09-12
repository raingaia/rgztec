// apps/api/src/modules/packager/packager.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class PackagerService {
  ping() {
    return { ok: true, ts: new Date().toISOString() };
  }
}
