import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { AppController } from './app.controller';
import { ArticlesModule } from './articles/articles.module';
import { TopicsModule } from './topics/topics.module';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { ArticlesResolver } from './graphql/resolvers/articles.resolver';
import { TopicsResolver } from './graphql/resolvers/topics.resolver';
import { UsersResolver } from './graphql/resolvers/users.resolver';
import { ComplexityPlugin } from './graphql/plugins/complexity.plugin';
import { RequestTimingInterceptor } from './common/interceptors/request-timing.interceptor';
import { EtagInterceptor } from './common/interceptors/etag.interceptor';
import './graphql/enums/graphql.enums';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        AuthModule.register({
            jwtSecret: process.env.AUTH_JWT_SECRET || 'dev-secret-change-me',
            jwtExpiresIn: process.env.AUTH_JWT_EXPIRES_IN || '1d',
            cookieName: process.env.AUTH_COOKIE_NAME || 'kvantik_auth',
            cookieMaxAgeMs: Number(process.env.AUTH_COOKIE_MAX_AGE_MS || 86_400_000),
            cookieSecure: process.env.AUTH_COOKIE_SECURE === 'true',
            cookieSameSite: (process.env.AUTH_COOKIE_SAME_SITE as 'lax' | 'strict' | 'none') || 'lax',
            loginPath: process.env.AUTH_LOGIN_PATH || '/auth/login',
        }),
        CacheModule.register({
            isGlobal: true,
            ttl: 5_000,
        }),
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            path: '/graphql',
            autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
            sortSchema: true,
            playground: false,
            introspection: true,
            plugins: [ApolloServerPluginLandingPageLocalDefault()],
            context: ({ req, res }) => ({ req, res }),
        }),
        PrismaModule,
        UsersModule,
        TopicsModule,
        ArticlesModule,
    ],
    controllers: [AppController],
    providers: [
        UsersResolver,
        TopicsResolver,
        ArticlesResolver,
        ComplexityPlugin,
        {
            provide: APP_INTERCEPTOR,
            useClass: RequestTimingInterceptor,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: EtagInterceptor,
        },
    ],
})
export class AppModule {}
