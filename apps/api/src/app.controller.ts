import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  root() {
    return {
      ok: true,
      message: 'RGZTEC API is running',
      routes: [
        '/integrity/sha256?q=TEXT',
        'POST /licensing/issue',
        'POST /licensing/verify',
        '/packager/*'
      ],
    };
  }
}
