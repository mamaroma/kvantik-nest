import {
    Body,
    Controller,
    Delete,
    Get,
    Header,
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
import { UserRole } from '@prisma/client';
import { ApiCookieAuth, ApiForbiddenResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { PublicAccess } from '../../auth/decorators/public-access.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { ArticleResponseDto, PaginatedArticlesResponseDto } from '../../articles/dto/article-response.dto';
import { ArticlesService } from '../../articles/articles.service';
import { ErrorResponseDto } from '../../common/dto/error-response.dto';
import { buildPaginationMeta } from '../../common/pagination/pagination-meta.dto';
import { setPaginationLinks } from '../../common/pagination/pagination-links';
import { PaginationQueryDto, paginationToPrisma } from '../../common/pagination/pagination-query.dto';
import { CreateUserDto } from '../dto/create-user.dto';
import { PaginatedUsersResponseDto, UserResponseDto } from '../dto/user-response.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UsersService } from '../users.service';

@ApiTags('users')
@Controller('api/users')
export class UsersApiController {
    constructor(
        private readonly usersService: UsersService,
        private readonly articlesService: ArticlesService,
    ) {}

    @PublicAccess()
    @Get()
    @Header('Cache-Control', 'public, max-age=60, must-revalidate')
    @ApiOperation({ summary: 'Получить список пользователей' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 10 })
    @ApiOkResponse({ type: PaginatedUsersResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    async findAll(
        @Query() query: PaginationQueryDto,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        const { page, limit, skip, take } = paginationToPrisma(query);
        const [items, totalItems] = await Promise.all([
            this.usersService.findManyPaginated(skip, take),
            this.usersService.count(),
        ]);

        setPaginationLinks(req, res, page, limit, totalItems);

        return {
            items,
            meta: buildPaginationMeta(page, limit, totalItems),
        };
    }

    @Roles(UserRole.ADMIN)
    @ApiCookieAuth('kvantik-auth')
    @ApiUnauthorizedResponse({ type: ErrorResponseDto })
    @ApiForbiddenResponse({ type: ErrorResponseDto })
    @Post()
    @ApiOperation({ summary: 'Создать пользователя' })
    @ApiCreatedResponse({ type: UserResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiConflictResponse({ type: ErrorResponseDto })
    async create(@Body() dto: CreateUserDto) {
        return this.usersService.create(dto);
    }

    @PublicAccess()
    @Get(':id')
    @Header('Cache-Control', 'public, max-age=60, must-revalidate')
    @ApiOperation({ summary: 'Получить пользователя по id' })
    @ApiOkResponse({ type: UserResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.usersService.findOne(id);
    }

    @Roles(UserRole.ADMIN)
    @ApiCookieAuth('kvantik-auth')
    @ApiUnauthorizedResponse({ type: ErrorResponseDto })
    @ApiForbiddenResponse({ type: ErrorResponseDto })
    @Patch(':id')
    @ApiOperation({ summary: 'Обновить пользователя' })
    @ApiOkResponse({ type: UserResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    @ApiConflictResponse({ type: ErrorResponseDto })
    async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateUserDto) {
        return this.usersService.update(id, dto);
    }

    @Roles(UserRole.ADMIN)
    @ApiCookieAuth('kvantik-auth')
    @ApiUnauthorizedResponse({ type: ErrorResponseDto })
    @ApiForbiddenResponse({ type: ErrorResponseDto })
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Удалить пользователя' })
    @ApiNoContentResponse({ description: 'Пользователь удалён' })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async remove(@Param('id', new ParseUUIDPipe()) id: string) {
        await this.usersService.remove(id);
    }

    @PublicAccess()
    @Get(':id/articles')
    @Header('Cache-Control', 'public, max-age=60, must-revalidate')
    @ApiOperation({ summary: 'Получить все статьи автора' })
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
        await this.usersService.findOne(id);

        const { page, limit, skip, take } = paginationToPrisma(query);
        const [items, totalItems] = await Promise.all([
            this.articlesService.findByAuthorPaginated(id, skip, take),
            this.articlesService.countByAuthor(id),
        ]);

        setPaginationLinks(req, res, page, limit, totalItems);

        return {
            items,
            meta: buildPaginationMeta(page, limit, totalItems),
        };
    }

    @PublicAccess()
    @Get(':id/articles/:articleId')
    @Header('Cache-Control', 'public, max-age=60, must-revalidate')
    @ApiOperation({ summary: 'Получить конкретную статью автора' })
    @ApiOkResponse({ type: ArticleResponseDto })
    @ApiBadRequestResponse({ type: ErrorResponseDto })
    @ApiNotFoundResponse({ type: ErrorResponseDto })
    async findUserArticle(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Param('articleId', new ParseUUIDPipe()) articleId: string,
    ) {
        await this.usersService.findOne(id);
        return this.articlesService.findOneByAuthor(id, articleId);
    }
}
