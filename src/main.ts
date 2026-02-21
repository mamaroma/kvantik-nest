import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Static assets (CSS/JS/images)
  // Важно: index:false, иначе Express отдаст public/index.html на "/" и перекроет контроллер.
  app.useStaticAssets(join(process.cwd(), 'public'), { index: false });

  // Views (EJS templates)
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('ejs');

  // Graceful shutdown for Prisma
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const configService = app.get(ConfigService);
  const port = Number(configService.get('PORT') ?? 3000);

  await app.listen(port, '0.0.0.0');
}

bootstrap();
