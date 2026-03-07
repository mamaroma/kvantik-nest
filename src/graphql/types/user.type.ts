import { Field, GraphQLISODateTime, ID, Int, ObjectType } from '@nestjs/graphql';
import { UserRole } from '../enums/graphql.enums';
import { PageInfo } from './page-info.type';
import { Article } from './article.type';

@ObjectType({ description: 'Пользователь редакционной системы.' })
export class User {
  @Field(() => ID, { description: 'Уникальный идентификатор пользователя.' })
  id!: string;

  @Field({ description: 'Электронная почта пользователя.' })
  email!: string;

  @Field({ description: 'Имя пользователя.' })
  name!: string;

  @Field(() => UserRole, { description: 'Роль пользователя в системе.' })
  role!: UserRole;

  @Field(() => GraphQLISODateTime, { description: 'Дата создания пользователя.' })
  createdAt!: Date;

  @Field(() => [Article], {
    nullable: 'itemsAndList',
    description: 'Статьи, созданные этим пользователем.',
    complexity: 3,
  })
  articles?: Article[];
}

@ObjectType({ description: 'Постраничный список пользователей.' })
export class UserConnection {
  @Field(() => [User], { description: 'Элементы текущей страницы.' })
  items!: User[];

  @Field(() => PageInfo, { description: 'Информация о пагинации.' })
  meta!: PageInfo;

  @Field(() => Int, { description: 'Количество элементов на текущей странице.' })
  count!: number;
}
