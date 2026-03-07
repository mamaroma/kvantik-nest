import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateTopicDto {
    @ApiPropertyOptional({ example: 'Физика' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    title?: string;

    @ApiPropertyOptional({ example: 'fizika' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ example: 'Явления природы, эксперименты, модели.' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    description?: string;
}
