// apps/api/src/modules/integrity/integrity.service.ts
import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class IntegrityService {
  sha256(input: string) {
    return createHash('sha256').update(input).digest('hex');
  }
}
