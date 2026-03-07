import { Field, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

@InputType({ description: 'Данные для создания темы.' })
export class CreateTopicInput {
  @Field(() => String, { description: 'Название темы.' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => String, { nullable: true, description: 'Человекочитаемый slug темы.' })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true, description: 'Краткое описание темы.' })
  @IsOptional()
  @IsString()
  description?: string;
}

@InputType({ description: 'Данные для изменения темы.' })
export class UpdateTopicInput {
  @Field(() => ID, { description: 'Идентификатор темы.' })
  @IsUUID()
  id!: string;

  @Field(() => String, { nullable: true, description: 'Новое название темы.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @Field(() => String, { nullable: true, description: 'Новый slug темы.' })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true, description: 'Новое описание темы.' })
  @IsOptional()
  @IsString()
  description?: string;
}
