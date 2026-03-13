import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
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
