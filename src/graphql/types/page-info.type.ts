import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Метаданные пагинации для списочных запросов.' })
export class PageInfo {
  @Field(() => Int, { description: 'Текущая страница, начиная с 1.' })
  page!: number;

  @Field(() => Int, { description: 'Размер страницы.' })
  limit!: number;

  @Field(() => Int, { description: 'Общее количество элементов.' })
  totalItems!: number;

  @Field(() => Int, { description: 'Общее количество страниц.' })
  totalPages!: number;
}
