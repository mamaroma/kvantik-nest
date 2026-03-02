import { Injectable } from '@nestjs/common';
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

    async findOne(id: string) {
        return this.prisma.topic.findUnique({ where: { id } });
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
