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
import { ArticleResponseDto, PaginatedArticlesResponseDto } from '../../articles/dto/article-response.dto';
import { ArticlesService } from '../../articles/articles.service';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { buildPaginationMeta } from '../../common/pagination/pagination-meta.dto';
import { setPaginationLinks } from '../../common/pagination/pagination-links';
import { PaginationQueryDto, paginationToPrisma } from '../../common/pagination/pagination-query.dto';
import { CreateTopicDto } from '../dto/create-topic.dto';
import { PaginatedTopicsResponseDto, TopicResponseDto } from '../dto/topic-response.dto';
import { UpdateTopicDto } from '../dto/update-topic.dto';
import { TopicsService } from '../topics.service';

@ApiTags('topics')
@Controller('api/topics')
export class TopicsApiController {
    constructor(
        private readonly topicsService: TopicsService,
        private readonly articlesService: ArticlesService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Получить список тем' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiOkResponse({ type: PaginatedTopicsResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    async findAll(
        @Query() query: PaginationQueryDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { page, limit, skip, take } = paginationToPrisma(query);
        const [items, totalItems] = await Promise.all([
            this.topicsService.findManyPaginated(skip, take),
            this.topicsService.count(),
        ]);

        setPaginationLinks(req, res, page, limit, totalItems);

        return {
            items,
            meta: buildPaginationMeta(page, limit, totalItems),
        };
    }

    @Post()
    @ApiOperation({ summary: 'Создать тему' })
    @ApiCreatedResponse({ type: TopicResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiConflictResponse({ type: ErrorResponseDto })
    async create(@Body() dto: CreateTopicDto) {
        return this.topicsService.create(dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить тему по id' })
    @ApiOkResponse({ type: TopicResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.topicsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить тему' })
    @ApiOkResponse({ type: TopicResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    @ApiConflictResponse({ type: ErrorResponseDto })
    async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateTopicDto) {
        return this.topicsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Удалить тему' })
    @ApiNoContentResponse({ description: 'Тема удалена' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.topicsService.remove(id);
    }

    @Get(':id/articles')
    @ApiOperation({ summary: 'Получить все статьи темы' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiOkResponse({ type: PaginatedArticlesResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findArticles(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Query() query: PaginationQueryDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        await this.topicsService.findOne(id);

        const { page, limit, skip, take } = paginationToPrisma(query);
        const [items, totalItems] = await Promise.all([
            this.articlesService.findByTopicPaginated(id, skip, take),
            this.articlesService.countByTopic(id),
        ]);

        setPaginationLinks(req, res, page, limit, totalItems);

        return {
            items,
            meta: buildPaginationMeta(page, limit, totalItems),
        };
    }

    @Get(':id/articles/:articleId')
    @ApiOperation({ summary: 'Получить конкретную статью темы' })
    @ApiOkResponse({ type: ArticleResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findTopicArticle(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Param('articleId', new ParseUUIDPipe()) articleId: string,
    ) {
        await this.topicsService.findOne(id);
        return this.articlesService.findOneByTopic(id, articleId);
    }
}
