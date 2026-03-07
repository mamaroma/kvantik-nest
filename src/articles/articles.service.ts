import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleStatus, Prisma } from '@prisma/client';
import { Subject } from 'rxjs';
import { slugify } from '../common/slug';

export type ArticleEventType = 'created' | 'updated' | 'deleted';

export type ArticleEvent = {
    type: ArticleEventType;
    articleId: string;
    title: string;
    at: string;
};

@Injectable()
export class ArticlesService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly eventsSubject = new Subject<ArticleEvent>();
    readonly events$ = this.eventsSubject.asObservable();

    private readonly articleInclude = {
        author: true,
        topic: true,
    } satisfies Prisma.ArticleInclude;

    async findAll() {
        return this.prisma.article.findMany({
            include: this.articleInclude,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findManyPaginated(skip: number, take: number) {
        return this.prisma.article.findMany({
            include: this.articleInclude,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }

    async count() {
        return this.prisma.article.count();
    }

    async findOne(id: string) {
        const article = await this.prisma.article.findUnique({
            where: { id },
            include: this.articleInclude,
        });

        if (!article) {
            throw new NotFoundException('Статья не найдена');
        }

        return article;
    }

    async findByTopicPaginated(topicId: string, skip: number, take: number) {
        return this.prisma.article.findMany({
            where: { topicId },
            include: this.articleInclude,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }

    async countByTopic(topicId: string) {
        return this.prisma.article.count({ where: { topicId } });
    }

    async findOneByTopic(topicId: string, articleId: string) {
        const article = await this.prisma.article.findFirst({
            where: { id: articleId, topicId },
            include: this.articleInclude,
        });

        if (!article) {
            throw new NotFoundException('Статья в указанной теме не найдена');
        }

        return article;
    }

    async findByAuthorPaginated(authorId: string, skip: number, take: number) {
        return this.prisma.article.findMany({
            where: { authorId },
            include: this.articleInclude,
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }

    async countByAuthor(authorId: string) {
        return this.prisma.article.count({ where: { authorId } });
    }

    async findOneByAuthor(authorId: string, articleId: string) {
        const article = await this.prisma.article.findFirst({
            where: { id: articleId, authorId },
            include: this.articleInclude,
        });

        if (!article) {
            throw new NotFoundException('Статья указанного автора не найдена');
        }

        return article;
    }

    private async makeUniqueSlug(baseRaw: string, excludeId?: string) {
        const base = baseRaw.trim();
        let candidate = base;
        let i = 2;

        if (!candidate) candidate = 'article';

        while (true) {
            const existing = await this.prisma.article.findFirst({
                where: excludeId ? { slug: candidate, NOT: { id: excludeId } } : { slug: candidate },
                select: { id: true },
            });

            if (!existing) return candidate;

            candidate = `${base}-${i++}`;
        }
    }

    async create(dto: CreateArticleDto) {
        const baseSlug = (dto.slug?.trim() || slugify(dto.title)).trim();
        let slug = await this.makeUniqueSlug(baseSlug);
        const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : null;

        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const created = await this.prisma.article.create({
                    data: {
                        title: dto.title.trim(),
                        slug,
                        summary: dto.summary?.trim() || null,
                        content: dto.content.trim(),
                        status: dto.status ?? ArticleStatus.DRAFT,
                        publishedAt,
                        authorId: dto.authorId,
                        topicId: dto.topicId,
                    },
                    include: this.articleInclude,
                });

                this.eventsSubject.next({
                    type: 'created',
                    articleId: created.id,
                    title: created.title,
                    at: new Date().toISOString(),
                });

                return created;
            } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    slug = await this.makeUniqueSlug(baseSlug);
                    continue;
                }
                throw e;
            }
        }

        throw new Error('Не удалось создать статью: не удалось подобрать уникальный slug');
    }

    async update(id: string, dto: UpdateArticleDto) {
        const existing = await this.prisma.article.findUnique({
            where: { id },
            select: { id: true, title: true, slug: true },
        });

        if (!existing) {
            throw new NotFoundException('Статья не найдена');
        }

        const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;
        let slug: string | undefined = undefined;

        if (typeof dto.slug === 'string') {
            const base = dto.slug.trim() || slugify(dto.title ?? existing.title);
            slug = await this.makeUniqueSlug(base, id);
        } else if (typeof dto.title === 'string') {
            const base = slugify(dto.title);
            slug = await this.makeUniqueSlug(base, id);
        }

        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const updated = await this.prisma.article.update({
                    where: { id },
                    data: {
                        title: dto.title?.trim(),
                        slug,
                        summary: dto.summary?.trim() || undefined,
                        content: dto.content?.trim(),
                        status: dto.status,
                        publishedAt,
                        authorId: dto.authorId,
                        topicId: dto.topicId,
                    },
                    include: this.articleInclude,
                });

                this.eventsSubject.next({
                    type: 'updated',
                    articleId: updated.id,
                    title: updated.title,
                    at: new Date().toISOString(),
                });

                return updated;
            } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    const base = (dto.slug?.trim() || (dto.title ? slugify(dto.title) : existing.slug)).trim();
                    slug = await this.makeUniqueSlug(base, id);
                    continue;
                }
                throw e;
            }
        }

        throw new Error('Не удалось обновить статью: не удалось подобрать уникальный slug');
    }

    async remove(id: string) {
        const existing = await this.findOne(id);
        const removed = await this.prisma.article.delete({ where: { id } });
        this.eventsSubject.next({
            type: 'deleted',
            articleId: removed.id,
            title: existing.title,
            at: new Date().toISOString(),
        });
        return removed;
    }
}
