import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'admin@kvantik.local' })
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    @IsEmail()
    email!: string;

    @ApiProperty({ example: 'admin123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password!: string;
}
