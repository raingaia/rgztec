import { Module } from '@nestjs/common';
import { PackagerController } from './packager.controller';
import { PackagerService } from './packager.service';
import { LicensingModule } from '../licensing/licensing.module';

@Module({
  imports: [LicensingModule],
  controllers: [PackagerController],
  providers: [PackagerService],
})
export class PackagerModule {}


