import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    Res,
} from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { buildPaginationMeta } from '../../common/pagination/pagination-meta.dto';
import { setPaginationLinks } from '../../common/pagination/pagination-links';
import { PaginationQueryDto, paginationToPrisma } from '../../common/pagination/pagination-query.dto';
import { TopicsService } from '../../topics/topics.service';
import { UsersService } from '../../users/users.service';
import { ArticleResponseDto, PaginatedArticlesResponseDto } from '../dto/article-response.dto';
import { TopicResponseDto } from '../../topics/dto/topic-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ArticlesService } from '../articles.service';

@ApiTags('articles')
@Controller('api/articles')
export class ArticlesApiController {
    constructor(
        private readonly articlesService: ArticlesService,
        private readonly usersService: UsersService,
        private readonly topicsService: TopicsService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Получить список статей' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiOkResponse({ type: PaginatedArticlesResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    async findAll(
        @Query() query: PaginationQueryDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { page, limit, skip, take } = paginationToPrisma(query);
        const [items, totalItems] = await Promise.all([
            this.articlesService.findManyPaginated(skip, take),
            this.articlesService.count(),
        ]);

        setPaginationLinks(req, res, page, limit, totalItems);

        return {
            items,
            meta: buildPaginationMeta(page, limit, totalItems),
        };
    }

    @Post()
    @ApiOperation({ summary: 'Создать статью' })
    @ApiCreatedResponse({ type: ArticleResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiConflictResponse({ type: ErrorResponseDto })
    async create(@Body() dto: CreateArticleDto) {
        return this.articlesService.create(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить статью по id' })
    @ApiOkResponse({ type: ArticleResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.articlesService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить статью' })
    @ApiOkResponse({ type: ArticleResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    @ApiConflictResponse({ type: ErrorResponseDto })
    async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateArticleDto) {
        return this.articlesService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Удалить статью' })
    @ApiNoContentResponse({ description: 'Статья удалена' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.articlesService.remove(id);
    }

    @Get(':id/author')
    @ApiOperation({ summary: 'Получить автора статьи' })
    @ApiOkResponse({ type: UserResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findAuthor(@Param('id', new ParseUUIDPipe()) id: string) {
        const article = await this.articlesService.findOne(id);
        return this.usersService.findOne(article.author.id);
    }

    @Get(':id/topic')
    @ApiOperation({ summary: 'Получить тему статьи' })
    @ApiOkResponse({ type: TopicResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findTopic(@Param('id', new ParseUUIDPipe()) id: string) {
        const article = await this.articlesService.findOne(id);
        return this.topicsService.findOne(article.topic.id);
    }
}
