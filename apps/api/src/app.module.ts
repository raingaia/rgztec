import { Module } from "@nestjs/common";
import { HealthModule } from "./modules/health/health.module";
import { GiftCardModule } from "./modules/giftcard/giftcard.module";

@Module({
  imports: [HealthModule, GiftCardModule]
})
export class AppModule {}
