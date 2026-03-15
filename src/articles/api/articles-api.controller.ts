import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
    HttpCode,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConflictResponse,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiTags,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { Express, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { ApiCookieAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PublicAccess } from '../../auth/decorators/public-access.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { memoryStorage } from 'multer';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { buildPaginationMeta } from '../../common/pagination/pagination-meta.dto';
import { setPaginationLinks } from '../../common/pagination/pagination-links';
import { PaginationQueryDto, paginationToPrisma } from '../../common/pagination/pagination-query.dto';
import { TopicsService } from '../../topics/topics.service';
import { UsersService } from '../../users/users.service';
import { ArticleMediaDto, ArticleResponseDto, PaginatedArticlesResponseDto } from '../dto/article-response.dto';
import { TopicResponseDto } from '../../topics/dto/topic-response.dto';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { CreateArticleDto } from '../dto/create-article.dto';
import { UpdateArticleDto } from '../dto/update-article.dto';
import { ArticlesService } from '../articles.service';
import { UploadArticleMediaDto } from '../dto/upload-article-media.dto';

@ApiTags('articles')
@Controller('api/articles')
export class ArticlesApiController {
    constructor(
        private readonly articlesService: ArticlesService,
        private readonly usersService: UsersService,
        private readonly topicsService: TopicsService,
    ) {}

    @PublicAccess()
    @Get()
    @Header('Cache-Control', 'public, max-age=60, must-revalidate')
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

    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    @ApiCookieAuth('kvantik-auth')
    @ApiUnauthorizedResponse({ type: ErrorResponseDto })
    @ApiForbiddenResponse({ type: ErrorResponseDto })
    @Post()
    @ApiOperation({ summary: 'Создать статью' })
    @ApiCreatedResponse({ type: ArticleResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiConflictResponse({ type: ErrorResponseDto })
    async create(@Body() dto: CreateArticleDto) {
        return this.articlesService.create(dto);
    }

    @PublicAccess()
    @Get(':id')
    @Header('Cache-Control', 'public, max-age=60, must-revalidate')
    @ApiOperation({ summary: 'Получить статью по id' })
    @ApiOkResponse({ type: ArticleResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.articlesService.findOne(id);
    }

    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    @ApiCookieAuth('kvantik-auth')
    @ApiUnauthorizedResponse({ type: ErrorResponseDto })
    @ApiForbiddenResponse({ type: ErrorResponseDto })
    @Post(':id/media')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    @ApiOperation({ summary: 'Загрузить изображение статьи в S3-совместимое хранилище' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadArticleMediaDto })
    @ApiCreatedResponse({ type: ArticleMediaDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    @ApiUnprocessableEntityResponse({ type: ErrorResponseDto })
    async uploadMedia(
        @Param('id', new ParseUUIDPipe()) id: string,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif)$/i })
                .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        )
        file: Express.Multer.File,
        @Body('caption') caption?: string,
    ) {
        return this.articlesService.uploadMedia(id, file, caption);
    }

    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    @ApiCookieAuth('kvantik-auth')
    @ApiUnauthorizedResponse({ type: ErrorResponseDto })
    @ApiForbiddenResponse({ type: ErrorResponseDto })
    @Patch(':id')
    @ApiOperation({ summary: 'Обновить статью' })
    @ApiOkResponse({ type: ArticleResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    @ApiConflictResponse({ type: ErrorResponseDto })
    async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateArticleDto) {
        return this.articlesService.update(id, dto);
    }

    @Roles(UserRole.ADMIN)
    @ApiCookieAuth('kvantik-auth')
    @ApiUnauthorizedResponse({ type: ErrorResponseDto })
    @ApiForbiddenResponse({ type: ErrorResponseDto })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Удалить статью' })
    @ApiNoContentResponse({ description: 'Статья удалена' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.articlesService.remove(id);
    }

    @PublicAccess()
    @Get(':id/author')
    @Header('Cache-Control', 'public, max-age=60, must-revalidate')
    @ApiOperation({ summary: 'Получить автора статьи' })
    @ApiOkResponse({ type: UserResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findAuthor(@Param('id', new ParseUUIDPipe()) id: string) {
        const article = await this.articlesService.findOne(id);
        return this.usersService.findOne(article.author.id);
    }

    @PublicAccess()
    @Get(':id/topic')
    @Header('Cache-Control', 'public, max-age=60, must-revalidate')
    @ApiOperation({ summary: 'Получить тему статьи' })
    @ApiOkResponse({ type: TopicResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findTopic(@Param('id', new ParseUUIDPipe()) id: string) {
        const article = await this.articlesService.findOne(id);
        return this.topicsService.findOne(article.topic.id);
    }
}
