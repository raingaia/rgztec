// apps/api/src/modules/packager/packager.module.ts
import { Module } from '@nestjs/common';
import { PackagerService } from './packager.service';
import { PackagerController } from './packager.controller';

@Module({
  controllers: [PackagerController],
  providers: [PackagerService],
  exports: [PackagerService],
})
export class PackagerModule {}
