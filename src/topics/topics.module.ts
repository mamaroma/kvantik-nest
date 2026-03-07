import { forwardRef, Module } from '@nestjs/common';
import { TopicsService } from './topics.service';
import { TopicsController } from './topics.controller';
import { ArticlesModule } from '../articles/articles.module';
import { TopicsApiController } from './api/topics-api.controller';

@Module({
    imports: [forwardRef(() => ArticlesModule)],
    controllers: [TopicsController, TopicsApiController],
    providers: [TopicsService],
    exports: [TopicsService],
})
export class TopicsModule {}
