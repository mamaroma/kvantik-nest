import { Field, GraphQLISODateTime, ID, Int, ObjectType } from '@nestjs/graphql';
import { ArticleStatus } from '../enums/graphql.enums';
import { PageInfo } from './page-info.type';
import { User } from './user.type';
import { Topic } from './topic.type';

@ObjectType({ description: 'Статья научно-популярного журнала.' })
export class Article {
  @Field(() => ID, { description: 'Уникальный идентификатор статьи.' })
  id!: string;

  @Field({ description: 'Заголовок статьи.' })
  title!: string;

  @Field({ description: 'Человекочитаемый slug статьи.' })
  slug!: string;

  @Field({ nullable: true, description: 'Краткий анонс статьи.' })
  summary!: string | null;

  @Field({ description: 'Основной текст статьи.' })
  content!: string;

  @Field(() => ArticleStatus, { description: 'Текущий статус статьи.' })
  status!: ArticleStatus;

  @Field(() => GraphQLISODateTime, {
    nullable: true,
    description: 'Дата публикации статьи.',
  })
  publishedAt!: Date | null;

  @Field(() => GraphQLISODateTime, { description: 'Дата создания статьи.' })
  createdAt!: Date;

  @Field(() => GraphQLISODateTime, { description: 'Дата последнего обновления статьи.' })
  updatedAt!: Date;

  @Field(() => User, {
    nullable: true,
    description: 'Автор статьи.',
    complexity: 2,
  })
  author?: User | null;

  @Field(() => Topic, {
    nullable: true,
    description: 'Тема статьи.',
    complexity: 2,
  })
  topic?: Topic | null;

  @Field(() => ID, { description: 'Идентификатор автора.' })
  authorId!: string;

  @Field(() => ID, { description: 'Идентификатор темы.' })
  topicId!: string;
}

@ObjectType({ description: 'Постраничный список статей.' })
export class ArticleConnection {
  @Field(() => [Article], { description: 'Элементы текущей страницы.' })
  items!: Article[];

  @Field(() => PageInfo, { description: 'Информация о пагинации.' })
  meta!: PageInfo;

  @Field(() => Int, { description: 'Количество элементов на текущей странице.' })
  count!: number;
}
