import { ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateArticleDto {
    @ApiPropertyOptional({ example: 'Почему небо голубое?' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @ApiPropertyOptional({ example: 'pochemu-nebo-goluboe' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ example: 'Краткое объяснение эффекта рассеяния Рэлея.' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    summary?: string;

    @ApiPropertyOptional({ example: 'Подробный текст статьи...' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    content?: string;

    @ApiPropertyOptional({ enum: ArticleStatus })
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsOptional()
    @IsEnum(ArticleStatus)
    status?: ArticleStatus;

    @ApiPropertyOptional({ example: '2026-03-07T10:00:00.000Z' })
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsOptional()
    @IsISO8601()
    publishedAt?: string;

    @ApiPropertyOptional({ format: 'uuid' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsUUID()
    authorId?: string;

    @ApiPropertyOptional({ format: 'uuid' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsUUID()
    topicId?: string;
}
