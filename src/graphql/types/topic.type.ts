import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { PageInfo } from './page-info.type';
import { Article } from './article.type';

@ObjectType({ description: 'Тематический раздел журнала.' })
export class Topic {
  @Field(() => ID, { description: 'Уникальный идентификатор темы.' })
  id!: string;

  @Field(() => String, { description: 'Название темы.' })
  title!: string;

  @Field(() => String, { description: 'Человекочитаемый slug темы.' })
  slug!: string;

  @Field(() => String, { nullable: true, description: 'Описание темы.' })
  description!: string | null;

  @Field(() => [Article], {
    nullable: 'itemsAndList',
    description: 'Статьи, относящиеся к этой теме.',
    complexity: 3,
  })
  articles?: Article[];
}

@ObjectType({ description: 'Постраничный список тем.' })
export class TopicConnection {
  @Field(() => [Topic], { description: 'Элементы текущей страницы.' })
  items!: Topic[];

  @Field(() => PageInfo, { description: 'Информация о пагинации.' })
  meta!: PageInfo;

  @Field(() => Int, { description: 'Количество элементов на текущей странице.' })
  count!: number;
}
