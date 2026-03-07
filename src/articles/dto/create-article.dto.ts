import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArticleStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateArticleDto {
    @ApiProperty({ example: 'Почему небо голубое?' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    title!: string;

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

    @ApiProperty({ example: 'Подробный текст статьи...' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    content!: string;

    @ApiPropertyOptional({ enum: ArticleStatus, default: ArticleStatus.DRAFT })
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsOptional()
    @IsEnum(ArticleStatus)
    status?: ArticleStatus;

    @ApiPropertyOptional({ example: '2026-03-07T10:00:00.000Z' })
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsOptional()
    @IsISO8601()
    publishedAt?: string;

    @ApiProperty({ format: 'uuid' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsUUID()
    authorId!: string;

    @ApiProperty({ format: 'uuid' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsUUID()
    topicId!: string;
}
