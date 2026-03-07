import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({ example: 404 })
    statusCode!: number;

    @ApiProperty({ example: 'Not Found' })
    error!: string;

    @ApiProperty({ example: 'Статья не найдена' })
    message!: string | string[];

    @ApiProperty({ example: '2026-03-07T10:00:00.000Z' })
    timestamp!: string;

    @ApiProperty({ example: '/api/articles/123' })
    path!: string;
}
