import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class PaginationQueryDto {
    @ApiPropertyOptional({ example: 1, default: 1, minimum: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page: number = 1;

    @ApiPropertyOptional({ example: 10, default: 10, minimum: 1, maximum: 50 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit: number = 10;
}

export function paginationToPrisma(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    return {
        page,
        limit,
        skip: (page - 1) * limit,
        take: limit,
    };
}
