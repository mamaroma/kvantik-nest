import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { Module } from '@nestjs/common';
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
import './graphql/enums/graphql.enums';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/graphql',
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: false,
      introspection: true,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    PrismaModule,
    UsersModule,
    TopicsModule,
    ArticlesModule,
  ],
  controllers: [AppController],
  providers: [UsersResolver, TopicsResolver, ArticlesResolver, ComplexityPlugin],
})
export class AppModule {}
