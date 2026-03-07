import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationMetaDto } from '../../common/pagination/pagination-meta.dto';

export class TopicResponseDto {
    @ApiProperty({ format: 'uuid' })
    id!: string;

    @ApiProperty({ example: 'Физика' })
    title!: string;

    @ApiProperty({ example: 'fizika' })
    slug!: string;

    @ApiPropertyOptional({ example: 'Явления природы, эксперименты, модели.' })
    description!: string | null;
}

export class PaginatedTopicsResponseDto {
    @ApiProperty({ type: () => [TopicResponseDto] })
    items!: TopicResponseDto[];

    @ApiProperty({ type: () => PaginationMetaDto })
    meta!: PaginationMetaDto;
}
