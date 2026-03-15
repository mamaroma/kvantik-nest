import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    const configService = app.get(ConfigService);


    app.enableShutdownHooks();

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());

    app.use((req: any, _res: any, next: any) => {
        const m = (req.query?._method || req.body?._method) as string | undefined;
        if (req.method === 'POST' && m) req.method = String(m).toUpperCase();
        next();
    });

    app.useStaticAssets(join(process.cwd(), 'public'), { index: false });
    app.setBaseViewsDir(join(process.cwd(), 'views'));
    app.setViewEngine('ejs');

    app.enableCors({
        origin: (configService.get<string>('CORS_ORIGIN') || 'http://localhost:3000').split(','),
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        methods: ['GET', 'HEAD', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    });

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Квантик REST API')
        .setDescription('RESTful API и OpenAPI-спецификация для журнала «Квантик».')
        .setVersion('1.0.0')
        .addCookieAuth('kvantik_auth', {
            type: 'apiKey',
            in: 'cookie',
            name: 'kvantik_auth',
            description: 'JWT access token в HttpOnly cookie',
        }, 'kvantik-auth')
        .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });

    const port = Number(configService.get('PORT') ?? 3000);

    await app.listen(port, '0.0.0.0');
}

bootstrap();
