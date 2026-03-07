import { Field, GraphQLISODateTime, ID, InputType } from '@nestjs/graphql';
import { IsEnum, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ArticleStatus } from '../enums/graphql.enums';

@InputType({ description: 'Данные для создания статьи.' })
export class CreateArticleInput {
  @Field(() => String, { description: 'Заголовок статьи.' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @Field(() => String, { nullable: true, description: 'Человекочитаемый slug статьи.' })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true, description: 'Краткий анонс статьи.' })
  @IsOptional()
  @IsString()
  summary?: string;

  @Field(() => String, { description: 'Основной текст статьи.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @Field(() => ArticleStatus, {
    nullable: true,
    description: 'Начальный статус статьи.',
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Дата публикации статьи, если она известна заранее.',
  })
  @IsOptional()
  @IsISO8601()
  publishedAt?: string;

  @Field(() => ID, { description: 'Идентификатор автора статьи.' })
  @IsUUID()
  authorId!: string;

  @Field(() => ID, { description: 'Идентификатор темы статьи.' })
  @IsUUID()
  topicId!: string;
}

@InputType({ description: 'Данные для изменения статьи.' })
export class UpdateArticleInput {
  @Field(() => ID, { description: 'Идентификатор статьи.' })
  @IsUUID()
  id!: string;

  @Field(() => String, { nullable: true, description: 'Новый заголовок статьи.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @Field(() => String, { nullable: true, description: 'Новый slug статьи.' })
  @IsOptional()
  @IsString()
  slug?: string;

  @Field(() => String, { nullable: true, description: 'Новый анонс статьи.' })
  @IsOptional()
  @IsString()
  summary?: string;

  @Field(() => String, { nullable: true, description: 'Новый текст статьи.' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  content?: string;

  @Field(() => ArticleStatus, {
    nullable: true,
    description: 'Новый статус статьи.',
  })
  @IsOptional()
  @IsEnum(ArticleStatus)
  status?: ArticleStatus;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Новая дата публикации статьи.',
  })
  @IsOptional()
  @IsISO8601()
  publishedAt?: string;

  @Field(() => ID, { nullable: true, description: 'Новый автор статьи.' })
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @Field(() => ID, { nullable: true, description: 'Новая тема статьи.' })
  @IsOptional()
  @IsUUID()
  topicId?: string;
}
