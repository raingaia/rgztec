import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = Number(process.env.API_PORT || 4000);
  await app.listen(port);
  console.log(`API ready → http://localhost:${port}`);
}
bootstrap();
