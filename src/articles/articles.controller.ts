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
    Render,
    Req,
    Res,
    Sse,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ArticleStatus, Prisma, UserRole } from '@prisma/client';
import { Express, Request, Response } from 'express';
import { memoryStorage } from 'multer';
import { map, Observable } from 'rxjs';
import { PublicAccess } from '../auth/decorators/public-access.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { sessionFromRequest } from '../common/session';
import { TopicsService } from '../topics/topics.service';
import { UsersService } from '../users/users.service';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@Controller('articles')
export class ArticlesController {
    constructor(
        private readonly articlesService: ArticlesService,
        private readonly topicsService: TopicsService,
        private readonly usersService: UsersService,
    ) {}

    @PublicAccess()
    @Get()
    @Render('articles/list')
    async list(@Req() req: Request) {
        await this.topicsService.ensureDefaultTopics();
        await this.usersService.ensureDefaultAuthor();

        const articles = await this.articlesService.findAll();
        return {
            pageTitle: 'Квантик — Статьи',
            activePage: 'articles',
            session: sessionFromRequest(req),
            articles,
        };
    }

    @PublicAccess()
    @Sse('sse')
    sse(): Observable<MessageEvent> {
        return this.articlesService.events$.pipe(map((ev) => ({ data: JSON.stringify(ev) })));
    }

    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    @Get('add')
    @Render('articles/form')
    async addForm(@Req() req: Request) {
        await this.topicsService.ensureDefaultTopics();
        await this.usersService.ensureDefaultAuthor();

        const topics = await this.topicsService.findAll();
        const authors = (await this.usersService.findAll()).filter((u) => u.role !== UserRole.READER);

        return {
            pageTitle: 'Квантик — Добавить статью',
            activePage: 'articles',
            session: sessionFromRequest(req),
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

    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    @Post()
    async create(@Body() dto: CreateArticleDto, @Req() req: Request, @Res() res: Response) {
        try {
            const created = await this.articlesService.create(dto);
            return res.redirect(`/articles/${created.id}`);
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                await this.topicsService.ensureDefaultTopics();
                await this.usersService.ensureDefaultAuthor();
                const topics = await this.topicsService.findAll();
                const authors = (await this.usersService.findAll()).filter((u) => u.role !== UserRole.READER);

                return res.status(400).render('articles/form', {
                    pageTitle: 'Квантик — Добавить статью',
                    activePage: 'articles',
                    session: sessionFromRequest(req),
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

    @PublicAccess()
    @Get(':id')
    @Render('articles/detail')
    async detail(@Param('id') id: string, @Req() req: Request) {
        const article = await this.articlesService.findOne(id);
        return {
            pageTitle: 'Квантик — Статья',
            activePage: 'articles',
            session: sessionFromRequest(req),
            article,
        };
    }

    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
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
        @Res() res: Response,
    ) {
        await this.articlesService.uploadMedia(id, file, caption);
        return res.redirect(`/articles/${id}`);
    }

    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    @Get(':id/edit')
    @Render('articles/form')
    async editForm(@Param('id') id: string, @Req() req: Request) {
        const [article, topics, authors] = await Promise.all([
            this.articlesService.findOne(id),
            this.topicsService.findAll(),
            this.usersService.findAll(),
        ]);

        return {
            pageTitle: 'Квантик — Редактировать статью',
            activePage: 'articles',
            session: sessionFromRequest(req),
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

    @Roles(UserRole.AUTHOR, UserRole.ADMIN)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateArticleDto, @Req() req: Request, @Res() res: Response) {
        try {
            await this.articlesService.update(id, dto);
            return res.redirect(`/articles/${id}`);
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
                    session: sessionFromRequest(req),
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

    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        await this.articlesService.remove(id);
        return res.redirect('/articles');
    }
}
