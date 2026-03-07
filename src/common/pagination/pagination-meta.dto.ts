import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
    @ApiProperty({ example: 1 })
    page!: number;

    @ApiProperty({ example: 10 })
    limit!: number;

    @ApiProperty({ example: 37 })
    totalItems!: number;

    @ApiProperty({ example: 4 })
    totalPages!: number;
}

export function buildPaginationMeta(page: number, limit: number, totalItems: number): PaginationMetaDto {
    return {
        page,
        limit,
        totalItems,
        totalPages: Math.max(1, Math.ceil(totalItems / limit)),
    };
}
