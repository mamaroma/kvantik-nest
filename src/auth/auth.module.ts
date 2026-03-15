import { DynamicModule, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { AUTH_OPTIONS } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthModuleOptions } from './auth.interfaces';
import { AuthContextMiddleware } from './middleware/auth-context.middleware';
import { AuthRedirectMiddleware } from './middleware/auth-redirect.middleware';

@Module({})
export class AuthModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthContextMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL });
        consumer.apply(AuthRedirectMiddleware).forRoutes(
            { path: 'users', method: RequestMethod.ALL },
            { path: 'users/*path', method: RequestMethod.ALL },
            { path: 'topics/add', method: RequestMethod.ALL },
            { path: 'topics/:id/edit', method: RequestMethod.ALL },
            { path: 'articles/add', method: RequestMethod.ALL },
            { path: 'articles/:id/edit', method: RequestMethod.ALL },
        );
    }

    static register(options: AuthModuleOptions): DynamicModule {
        return {
            module: AuthModule,
            imports: [PrismaModule],
            controllers: [AuthController],
            providers: [
                { provide: AUTH_OPTIONS, useValue: options },
                AuthService,
                AuthContextMiddleware,
                AuthRedirectMiddleware,
                { provide: APP_GUARD, useClass: AuthGuard },
                { provide: APP_GUARD, useClass: RolesGuard },
            ],
            exports: [AuthService, AUTH_OPTIONS],
            global: true,
        };
    }
}
