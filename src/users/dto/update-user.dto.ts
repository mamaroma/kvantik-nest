import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'reader@kvantik.local' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: 'Анна Иванова' })
    @Transform(({ value }) => (value === '' ? undefined : typeof value === 'string' ? value.trim() : value))
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @ApiPropertyOptional({ example: 'newStrongPass1' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ enum: UserRole })
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
