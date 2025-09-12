import { Body, Controller, Post } from '@nestjs/common';
import { LicensingService } from './licensing.service';
import { IssueRequest, VerifyRequest } from './types';

@Controller('licensing')
export class LicensingController {
  constructor(private lic: LicensingService) {}

  @Post('issue')
  issue(@Body() body: IssueRequest) {
    const rec = this.lic.issue(body);
    return { ok: true, licenseKey: rec.key, email: rec.email, productId: rec.productId };
  }

  @Post('verify')
  verify(@Body() body: VerifyRequest) {
    const valid = this.lic.verify(body.productId, body.licenseKey);
    return { ok: valid };
  }
}

