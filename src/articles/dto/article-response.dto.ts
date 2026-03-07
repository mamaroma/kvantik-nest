import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus, UserRole } from '@prisma/client';
import { PaginationMetaDto } from '../../common/pagination/pagination-meta.dto';

export class ArticleAuthorDto {
    @ApiProperty({ format: 'uuid' })
    id!: string;

    @ApiProperty({ example: 'author@kvantik.local' })
    email!: string;

    @ApiProperty({ example: 'Автор по умолчанию' })
    name!: string;

    @ApiProperty({ enum: UserRole })
    role!: UserRole;

    @ApiProperty({ example: '2026-03-07T10:00:00.000Z' })
    createdAt!: Date;
}

export class ArticleTopicDto {
    @ApiProperty({ format: 'uuid' })
    id!: string;

    @ApiProperty({ example: 'Физика' })
    title!: string;

    @ApiProperty({ example: 'fizika' })
    slug!: string;

    @ApiPropertyOptional({ example: 'Явления природы, эксперименты, модели.' })
    description!: string | null;
}

export class ArticleResponseDto {
    @ApiProperty({ format: 'uuid' })
    id!: string;

    @ApiProperty({ example: 'Почему небо голубое?' })
    title!: string;

    @ApiProperty({ example: 'pochemu-nebo-goluboe' })
    slug!: string;

    @ApiPropertyOptional({ example: 'Краткое объяснение эффекта рассеяния Рэлея.' })
    summary!: string | null;

    @ApiProperty({ example: 'Подробный текст статьи...' })
    content!: string;

    @ApiProperty({ enum: ArticleStatus })
    status!: ArticleStatus;

    @ApiPropertyOptional({ example: '2026-03-07T10:00:00.000Z', nullable: true })
    publishedAt!: Date | null;

    @ApiProperty({ example: '2026-03-07T10:00:00.000Z' })
    createdAt!: Date;

    @ApiProperty({ example: '2026-03-07T10:00:00.000Z' })
    updatedAt!: Date;

    @ApiProperty({ type: () => ArticleAuthorDto })
    author!: ArticleAuthorDto;

    @ApiProperty({ type: () => ArticleTopicDto })
    topic!: ArticleTopicDto;
}

export class PaginatedArticlesResponseDto {
    @ApiProperty({ type: () => [ArticleResponseDto] })
    items!: ArticleResponseDto[];

    @ApiProperty({ type: () => PaginationMetaDto })
    meta!: PaginationMetaDto;
}
