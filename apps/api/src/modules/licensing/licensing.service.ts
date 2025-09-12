import { Injectable } from '@nestjs/common';
import { IssueRequest, LicenseRecord } from './types';

@Injectable()
export class LicensingService {
  private licenses = new Map<string, LicenseRecord>();

  private code(len = 4) {
    const s = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: len }, () => s[Math.floor(Math.random() * s.length)]).join('');
  }

  issue(req: IssueRequest): LicenseRecord {
    const key = `RGZ-${this.code()}-${this.code()}`;
    const rec = { productId: req.productId, email: req.buyerEmail, key, issuedAt: Date.now() };
    this.licenses.set(key, rec);
    return rec;
  }

  verify(productId: string, licenseKey: string) {
    const rec = this.licenses.get(licenseKey);
    return !!rec && rec.productId === productId;
  }
}
