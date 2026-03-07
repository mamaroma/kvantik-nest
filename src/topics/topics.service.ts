import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { slugify } from '../common/slug';

@Injectable()
export class TopicsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.topic.findMany({ orderBy: { title: 'asc' } });
    }

    async findManyPaginated(skip: number, take: number) {
        return this.prisma.topic.findMany({
            orderBy: { title: 'asc' },
            skip,
            take,
        });
    }

    async count() {
        return this.prisma.topic.count();
    }

    async findOne(id: string) {
        const topic = await this.prisma.topic.findUnique({ where: { id } });
        if (!topic) {
            throw new NotFoundException('Тема не найдена');
        }
        return topic;
    }

    async create(dto: CreateTopicDto) {
        const slug = (dto.slug?.trim() || slugify(dto.title)).trim();
        return this.prisma.topic.create({
            data: {
                title: dto.title.trim(),
                slug,
                description: dto.description?.trim() || null,
            },
        });
    }

    async update(id: string, dto: UpdateTopicDto) {
        await this.findOne(id);
        const slug = dto.slug ? dto.slug.trim() : undefined;
        return this.prisma.topic.update({
            where: { id },
            data: {
                title: dto.title?.trim(),
                slug,
                description: dto.description?.trim() || undefined,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.topic.delete({ where: { id } });
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
    }
}
