import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UsersService } from '../../users/users.service';
import { ArticlesService } from '../../articles/articles.service';
import { buildPaginationMeta } from '../../common/pagination/pagination-meta.dto';
import { paginationArgsToPrisma, PaginationArgs } from '../inputs/pagination.args';
import { CreateUserInput, UpdateUserInput } from '../inputs/user.inputs';
import { Article } from '../types/article.type';
import { User, UserConnection } from '../types/user.type';

@Resolver(() => User)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly articlesService: ArticlesService,
  ) {}

  @Query(() => UserConnection, {
    name: 'users',
    description: 'Получить список пользователей с пагинацией.',
    complexity: ({ args, childComplexity }) => (args.limit ?? 10) * childComplexity,
  })
  async findAll(@Args() args: PaginationArgs): Promise<UserConnection> {
    const { page, limit, skip, take } = paginationArgsToPrisma(args);
    const [items, totalItems] = await Promise.all([
      this.usersService.findManyPaginated(skip, take),
      this.usersService.count(),
    ]);

    return {
      items,
      meta: buildPaginationMeta(page, limit, totalItems),
      count: items.length,
    };
  }

  @Query(() => User, {
    name: 'user',
    description: 'Получить одного пользователя по идентификатору.',
  })
  findOne(@Args('id', { type: () => ID, description: 'Идентификатор пользователя.' }) id: string) {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User, {
    description: 'Создать нового пользователя.',
  })
  createUser(@Args('input', { description: 'Данные нового пользователя.' }) input: CreateUserInput) {
    return this.usersService.create(input);
  }

  @Mutation(() => User, {
    description: 'Изменить существующего пользователя.',
  })
  updateUser(@Args('input', { description: 'Новые данные пользователя.' }) input: UpdateUserInput) {
    const { id, ...dto } = input;
    return this.usersService.update(id, dto);
  }

  @Mutation(() => User, {
    description: 'Удалить пользователя.',
  })
  deleteUser(@Args('id', { type: () => ID, description: 'Идентификатор пользователя.' }) id: string) {
    return this.usersService.remove(id);
  }

  @ResolveField(() => [Article], {
    name: 'articles',
    description: 'Получить статьи указанного пользователя.',
  })
  async articles(@Parent() user: User): Promise<Article[]> {
    return this.articlesService.findByAuthorPaginated(user.id, 0, 20);
  }
}
