import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.enableShutdownHooks();

    app.useStaticAssets(join(process.cwd(), 'public'), { index: false });


    app.setBaseViewsDir(join(process.cwd(), 'views'));
    app.setViewEngine('ejs');

    const configService = app.get(ConfigService);
    const port = Number(configService.get('PORT') ?? 3000);

    await app.listen(port, '0.0.0.0');
}

bootstrap();
