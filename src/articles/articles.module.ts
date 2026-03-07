import { forwardRef, Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { TopicsModule } from '../topics/topics.module';
import { UsersModule } from '../users/users.module';
import { ArticlesApiController } from './api/articles-api.controller';

@Module({
    imports: [forwardRef(() => TopicsModule), forwardRef(() => UsersModule)],
    controllers: [ArticlesController, ArticlesApiController],
    providers: [ArticlesService],
    exports: [ArticlesService],
})
export class ArticlesModule {}
