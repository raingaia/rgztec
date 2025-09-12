import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class IntegrityService {
  sha256(input: string): string {
    return createHash('sha256').update(input).digest('hex');
  }
}
