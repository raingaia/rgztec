import { Module, Controller, Get } from '@nestjs/common';

@Controller('health')
class HealthController {
  @Get()
  ok() {
    return { ok: true, ts: new Date().toISOString() };
  }
}

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
