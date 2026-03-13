import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Topic } from '@prisma/client';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { slugify } from '../common/slug';

@Injectable()
export class TopicsService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    async findAll() {
        const cacheKey = 'topics:all';
        const cached = await this.cacheManager.get<Topic[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const topics = await this.prisma.topic.findMany({ orderBy: { title: 'asc' } });
        await this.cacheManager.set(cacheKey, topics);
        return topics;
    }

    async findManyPaginated(skip: number, take: number) {
        const cacheKey = `topics:list:${skip}:${take}`;
        const cached = await this.cacheManager.get<Topic[]>(cacheKey);
        if (cached) {
            return cached;
        }

        const topics = await this.prisma.topic.findMany({
            orderBy: { title: 'asc' },
            skip,
            take,
        });
        await this.cacheManager.set(cacheKey, topics);
        return topics;
    }

    async count() {
        const cacheKey = 'topics:count';
        const cached = await this.cacheManager.get<number>(cacheKey);
        if (typeof cached === 'number') {
            return cached;
        }

        const total = await this.prisma.topic.count();
        await this.cacheManager.set(cacheKey, total);
        return total;
    }

    async findOne(id: string) {
        const cacheKey = `topics:one:${id}`;
        const cached = await this.cacheManager.get<Topic>(cacheKey);
        if (cached) {
            return cached;
        }

        const topic = await this.prisma.topic.findUnique({ where: { id } });
        if (!topic) {
            throw new NotFoundException('Тема не найдена');
        }

        await this.cacheManager.set(cacheKey, topic);
        return topic;
    }

    async create(dto: CreateTopicDto) {
        const slug = (dto.slug?.trim() || slugify(dto.title)).trim();
        const created = await this.prisma.topic.create({
            data: {
                title: dto.title.trim(),
                slug,
                description: dto.description?.trim() || null,
            },
        });
        await this.resetTopicsCache();
        return created;
    }

    async update(id: string, dto: UpdateTopicDto) {
        await this.findOne(id);
        const slug = dto.slug ? dto.slug.trim() : undefined;
        const updated = await this.prisma.topic.update({
            where: { id },
            data: {
                title: dto.title?.trim(),
                slug,
                description: dto.description?.trim() || undefined,
            },
        });
        await this.resetTopicsCache();
        return updated;
    }

    async remove(id: string) {
        await this.findOne(id);
        const removed = await this.prisma.topic.delete({ where: { id } });
        await this.resetTopicsCache();
        return removed;
    }

    async ensureDefaultTopics() {
        const count = await this.prisma.topic.count();
        if (count > 0) return;
        await this.prisma.topic.createMany({
            data: [
                { title: 'Физика', slug: 'fizika', description: 'Явления природы, эксперименты, модели.' },
                { title: 'Математика', slug: 'matematika', description: 'Идеи, доказательства, задачи.' },
                { title: 'ИТ', slug: 'it', description: 'Алгоритмы, сети, искусственный интеллект.' },
            ],
        });
        await this.resetTopicsCache();
    }

    private async resetTopicsCache() {
        await this.cacheManager.clear();
    }
}
