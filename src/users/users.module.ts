import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { ArticlesModule } from '../articles/articles.module';
import { UsersApiController } from './api/users-api.controller';

@Module({
    imports: [forwardRef(() => ArticlesModule)],
    controllers: [UsersController, UsersApiController],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule {}
