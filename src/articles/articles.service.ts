import { Injectable } from '@nestjs/common';
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
    at: string; // ISO
};

@Injectable()
export class ArticlesService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly eventsSubject = new Subject<ArticleEvent>();
    readonly events$ = this.eventsSubject.asObservable();

    async findAll() {
        return this.prisma.article.findMany({
            include: { author: true, topic: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string) {
        return this.prisma.article.findUnique({
            where: { id },
            include: { author: true, topic: true },
        });
    }

    private async makeUniqueSlug(baseRaw: string, excludeId?: string) {
        const base = baseRaw.trim();
        let candidate = base;
        let i = 2;

        // Чтобы не было бесконечного цикла при совсем странных данных
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

        // На случай гонки (две записи одновременно с одинаковым slug)
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

        // Если уж совсем не повезло
        throw new Error('Не удалось создать статью: не удалось подобрать уникальный slug');
    }

    async update(id: string, dto: UpdateArticleDto) {
        const existing = await this.prisma.article.findUnique({
            where: { id },
            select: { id: true, title: true, slug: true },
        });
        if (!existing) return null;

        const publishedAt = dto.publishedAt ? new Date(dto.publishedAt) : undefined;

        // slug меняем только если он пришёл ИЛИ если пришёл title и slug не прислан (тогда пересоберём slug из title)
        let slug: string | undefined = undefined;

        if (typeof dto.slug === 'string') {
            const base = dto.slug.trim() || slugify(dto.title ?? existing.title);
            slug = await this.makeUniqueSlug(base, id);
        } else if (typeof dto.title === 'string') {
            // если редактируют title и не задали slug вручную — обновим slug из title
            const base = slugify(dto.title);
            slug = await this.makeUniqueSlug(base, id);
        }

        // На случай гонки при update тоже
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
                    // если конфликт — пересоберём slug ещё раз с суффиксом
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
        const existing = await this.prisma.article.findUnique({ where: { id } });
        const removed = await this.prisma.article.delete({ where: { id } });
        this.eventsSubject.next({
            type: 'deleted',
            articleId: removed.id,
            title: existing?.title ?? removed.title,
            at: new Date().toISOString(),
        });
        return removed;
    }
}
