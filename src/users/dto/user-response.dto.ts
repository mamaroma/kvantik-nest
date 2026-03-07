import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { PaginationMetaDto } from '../../common/pagination/pagination-meta.dto';

export class UserResponseDto {
    @ApiProperty({ format: 'uuid' })
    id!: string;

    @ApiProperty({ example: 'reader@kvantik.local' })
    email!: string;

    @ApiProperty({ example: 'Анна Иванова' })
    name!: string;

    @ApiProperty({ enum: UserRole })
    role!: UserRole;

    @ApiProperty({ example: '2026-03-07T10:00:00.000Z' })
    createdAt!: Date;
}

export class PaginatedUsersResponseDto {
    @ApiProperty({ type: () => [UserResponseDto] })
    items!: UserResponseDto[];

    @ApiProperty({ type: () => PaginationMetaDto })
    meta!: PaginationMetaDto;
}
