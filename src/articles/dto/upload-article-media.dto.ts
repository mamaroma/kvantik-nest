import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadArticleMediaDto {
    @ApiProperty({ type: 'string', format: 'binary' })
    file!: any;

    @ApiPropertyOptional({ example: 'Обложка выпуска' })
    caption?: string;
}
