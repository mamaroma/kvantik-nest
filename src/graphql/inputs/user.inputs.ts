import { Field, ID, InputType } from '@nestjs/graphql';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { UserRole } from '../enums/graphql.enums';

@InputType({ description: 'Данные для создания пользователя.' })
export class CreateUserInput {
  @Field({ description: 'Электронная почта пользователя.' })
  @IsEmail()
  email!: string;

  @Field({ description: 'Отображаемое имя пользователя.' })
  @IsString()
  @IsNotEmpty()
  name!: string;

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

  @Field({ nullable: true, description: 'Новый email пользователя.' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true, description: 'Новое имя пользователя.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @Field(() => UserRole, {
    nullable: true,
    description: 'Новая роль пользователя.',
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
