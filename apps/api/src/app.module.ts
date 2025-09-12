import { Module } from '@nestjs/common';
import { LicensingModule } from './modules/licensing/licensing.module';
import { GiftcardModule } from './modules/giftcard/giftcard.module';
import { PackagerModule } from './modules/packager/packager.module';
import { IntegrityModule } from './modules/integrity/integrity.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { AppController } from './app.controller';

@Module({
  imports: [LicensingModule, GiftcardModule, PackagerModule, IntegrityModule, DeliveryModule],
  controllers: [AppController],
})
export class AppModule {}

