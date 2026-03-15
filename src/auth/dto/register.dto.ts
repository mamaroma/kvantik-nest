import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({ example: 'reader@kvantik.local' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'Анна Иванова' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsString()
    @IsNotEmpty()
    name!: string;

    @ApiProperty({ example: 'reader123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password!: string;

    @ApiPropertyOptional({ enum: UserRole, default: UserRole.READER })
    @Transform(({ value }) => (value === '' ? undefined : value))
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
