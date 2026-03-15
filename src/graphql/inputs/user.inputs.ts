import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '../enums/graphql.enums';

@InputType({ description: 'Данные для создания пользователя.' })
export class CreateUserInput {
    @Field(() => String, { description: 'Электронная почта пользователя.' })
    @IsEmail()
    email!: string;

    @Field(() => String, { description: 'Отображаемое имя пользователя.' })
    @IsString()
    @IsNotEmpty()
    name!: string;

    @Field(() => String, { description: 'Пароль пользователя.' })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password!: string;

    @Field(() => UserRole, {
        nullable: true,
        description: 'Роль пользователя. По умолчанию создаётся читатель.',
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

@InputType({ description: 'Данные для изменения пользователя.' })
export class UpdateUserInput {
    @Field(() => ID, { description: 'Идентификатор пользователя.' })
    @IsUUID()
    id!: string;

    @Field(() => String, { nullable: true, description: 'Новый email пользователя.' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @Field(() => String, { nullable: true, description: 'Новое имя пользователя.' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    name?: string;

    @Field(() => String, { nullable: true, description: 'Новый пароль пользователя.' })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    password?: string;

    @Field(() => UserRole, {
        nullable: true,
        description: 'Новая роль пользователя.',
    })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
