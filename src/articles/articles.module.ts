import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TopicsModule } from '../topics/topics.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TopicsModule, UsersModule],
    controllers: [ArticlesController],
    providers: [ArticlesService],
})
export class ArticlesModule {}
