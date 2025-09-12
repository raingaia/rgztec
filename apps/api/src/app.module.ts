import { Module } from '@nestjs/common';
import { LicensingModule } from './modules/licensing/licensing.module';
import { PackagerModule } from './modules/packager/packager.module';
import { IntegrityModule } from './modules/integrity/integrity.module';

@Module({
  imports: [LicensingModule, PackagerModule, IntegrityModule],
})
export class AppModule {}


