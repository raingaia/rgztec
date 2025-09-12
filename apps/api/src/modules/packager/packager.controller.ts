import { Body, Controller, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { PackagerService } from './packager.service';
import { LicensingService } from '../licensing/licensing.service';

type BuildRequest = { productId: string; licenseKey: string; sourceUrl?: string; repo?: string };

@Controller('packager')
export class PackagerController {
  constructor(private pkg: PackagerService, private lic: LicensingService) {}

  @Post('build')
  build(@Body() body: BuildRequest) {
    const ok = this.lic.verify(body.productId, body.licenseKey);
    if (!ok) return { ok: false, error: 'invalid_license' };

    const job = this.pkg.startBuild(body.productId, body.licenseKey, body.sourceUrl || body.repo || '');
    return { ok: true, jobId: job.id };
  }

  @Get('status/:id')
  status(@Param('id') id: string) {
    const job = this.pkg.getStatus(id);
    if (!job) throw new NotFoundException('job_not_found');
    return { ok: true, ...job };
  }
}

