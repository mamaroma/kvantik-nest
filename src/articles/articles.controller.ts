import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    MessageEvent,
    Param,
    ParseFilePipeBuilder,
    Patch,
    Post,
    Query,
    Render,
    Res,
    Sse,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express, Response } from 'express';
import { memoryStorage } from 'multer';
import { map, Observable } from 'rxjs';
import { sessionFromQuery } from '../common/session';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { TopicsService } from '../topics/topics.service';
import { UsersService } from '../users/users.service';
import { ArticleStatus, Prisma, UserRole } from '@prisma/client';

@Controller('articles')
export class ArticlesController {
    constructor(
        private readonly articlesService: ArticlesService,
        private readonly topicsService: TopicsService,
        private readonly usersService: UsersService,
    ) {}

    private buildQueryParams(query: { auth?: string; user?: string }) {
        const q = new URLSearchParams();
        if (query.auth) q.set('auth', query.auth);
        if (query.user) q.set('user', query.user);
        return q;
    }

    @Get()
    @Render('articles/list')
    async list(@Query() query: { auth?: string; user?: string }) {
        await this.topicsService.ensureDefaultTopics();
        await this.usersService.ensureDefaultAuthor();

        const articles = await this.articlesService.findAll();
        return {
            pageTitle: 'Квантик — Статьи',
            activePage: 'articles',
            session: sessionFromQuery(query),
            articles,
        };
    }

    @Sse('sse')
    sse(): Observable<MessageEvent> {
        return this.articlesService.events$.pipe(map((ev) => ({ data: JSON.stringify(ev) })));
    }

    @Get('add')
    @Render('articles/form')
    async addForm(@Query() query: { auth?: string; user?: string }) {
        await this.topicsService.ensureDefaultTopics();
        await this.usersService.ensureDefaultAuthor();

        const topics = await this.topicsService.findAll();
        const authors = (await this.usersService.findAll()).filter((u) => u.role !== UserRole.READER);

        return {
            pageTitle: 'Квантик — Добавить статью',
            activePage: 'articles',
            session: sessionFromQuery(query),
            mode: 'create',
            statuses: Object.values(ArticleStatus),
            topics,
            authors,
            error: null,
            article: {
                title: '',
                slug: '',
                summary: '',
                content: '',
                status: ArticleStatus.DRAFT,
                authorId: authors[0]?.id,
                topicId: topics[0]?.id,
                publishedAt: '',
            },
        };
    }

    @Post()
    async create(
        @Body() dto: CreateArticleDto,
        @Query() query: { auth?: string; user?: string },
        @Res() res: Response,
    ) {
        try {
            const created = await this.articlesService.create(dto);
            const q = this.buildQueryParams(query);
            return res.redirect(`/articles/${created.id}${q.toString() ? `?${q.toString()}` : ''}`);
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                await this.topicsService.ensureDefaultTopics();
                await this.usersService.ensureDefaultAuthor();
                const topics = await this.topicsService.findAll();
                const authors = (await this.usersService.findAll()).filter((u) => u.role !== UserRole.READER);

                return res.status(400).render('articles/form', {
                    pageTitle: 'Квантик — Добавить статью',
                    activePage: 'articles',
                    session: sessionFromQuery(query),
                    mode: 'create',
                    statuses: Object.values(ArticleStatus),
                    topics,
                    authors,
                    error: 'Такой slug уже существует. Измени slug или оставь поле пустым.',
                    article: {
                        ...dto,
                        publishedAt: (dto as any)?.publishedAt ?? '',
                    },
                });
            }
            throw e;
        }
    }

    @Get(':id')
    @Render('articles/detail')
    async detail(@Param('id') id: string, @Query() query: { auth?: string; user?: string }) {
        const article = await this.articlesService.findOne(id);
        return {
            pageTitle: 'Квантик — Статья',
            activePage: 'articles',
            session: sessionFromQuery(query),
            article,
        };
    }

    @Post(':id/media')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: memoryStorage(),
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    async uploadMedia(
        @Param('id') id: string,
        @UploadedFile(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({ fileType: /(jpg|jpeg|png|webp|gif)$/i })
                .addMaxSizeValidator({ maxSize: 5 * 1024 * 1024 })
                .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        )
        file: Express.Multer.File,
        @Body('caption') caption: string | undefined,
        @Query() query: { auth?: string; user?: string },
        @Res() res: Response,
    ) {
        await this.articlesService.uploadMedia(id, file, caption);
        const q = this.buildQueryParams(query);
        return res.redirect(`/articles/${id}${q.toString() ? `?${q.toString()}` : ''}`);
    }

    @Get(':id/edit')
    @Render('articles/form')
    async editForm(@Param('id') id: string, @Query() query: { auth?: string; user?: string }) {
        const [article, topics, authors] = await Promise.all([
            this.articlesService.findOne(id),
            this.topicsService.findAll(),
            this.usersService.findAll(),
        ]);

        return {
            pageTitle: 'Квантик — Редактировать статью',
            activePage: 'articles',
            session: sessionFromQuery(query),
            mode: 'edit',
            statuses: Object.values(ArticleStatus),
            topics,
            authors: authors.filter((u) => u.role !== UserRole.READER),
            error: null,
            article: {
                ...article,
                publishedAt: article?.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) : '',
            },
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateArticleDto,
        @Query() query: { auth?: string; user?: string },
        @Res() res: Response,
    ) {
        try {
            await this.articlesService.update(id, dto);
            const q = this.buildQueryParams(query);
            return res.redirect(`/articles/${id}${q.toString() ? `?${q.toString()}` : ''}`);
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                const [article, topics, authors] = await Promise.all([
                    this.articlesService.findOne(id),
                    this.topicsService.findAll(),
                    this.usersService.findAll(),
                ]);

                return res.status(400).render('articles/form', {
                    pageTitle: 'Квантик — Редактировать статью',
                    activePage: 'articles',
                    session: sessionFromQuery(query),
                    mode: 'edit',
                    statuses: Object.values(ArticleStatus),
                    topics,
                    authors: authors.filter((u) => u.role !== UserRole.READER),
                    error: 'Такой slug уже существует. Измени slug или оставь поле пустым.',
                    article: {
                        ...article,
                        ...dto,
                        publishedAt:
                            (dto as any)?.publishedAt ??
                            (article?.publishedAt ? new Date(article.publishedAt).toISOString().slice(0, 16) : ''),
                    },
                });
            }
            throw e;
        }
    }

    @Delete(':id')
    async remove(
        @Param('id') id: string,
        @Query() query: { auth?: string; user?: string },
        @Res() res: Response,
    ) {
        await this.articlesService.remove(id);
        const q = this.buildQueryParams(query);
        return res.redirect(`/articles${q.toString() ? `?${q.toString()}` : ''}`);
    }
}
