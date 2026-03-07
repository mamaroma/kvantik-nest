import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 'reader@kvantik.local' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'Анна Иванова' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiPropertyOptional({ enum: UserRole, default: UserRole.READER })
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
