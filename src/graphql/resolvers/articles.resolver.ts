import { Args, ID, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { ArticleStatus } from '@prisma/client';
import { ArticlesService } from '../../articles/articles.service';
import { TopicsService } from '../../topics/topics.service';
import { UsersService } from '../../users/users.service';
import { buildPaginationMeta } from '../../common/pagination/pagination-meta.dto';
import { paginationArgsToPrisma, PaginationArgs } from '../inputs/pagination.args';
import { CreateArticleInput, UpdateArticleInput } from '../inputs/article.inputs';
import { Article, ArticleConnection } from '../types/article.type';
import { Topic } from '../types/topic.type';
import { User } from '../types/user.type';

@Resolver(() => Article)
export class ArticlesResolver {
  constructor(
    private readonly articlesService: ArticlesService,
    private readonly usersService: UsersService,
    private readonly topicsService: TopicsService,
  ) {}

  @Query(() => ArticleConnection, {
    name: 'articles',
    description: 'Получить список статей с пагинацией.',
    complexity: ({ args, childComplexity }) => (args.limit ?? 10) * childComplexity,
  })
  async findAll(@Args() args: PaginationArgs): Promise<ArticleConnection> {
    const { page, limit, skip, take } = paginationArgsToPrisma(args);
    const [items, totalItems] = await Promise.all([
      this.articlesService.findManyPaginated(skip, take),
      this.articlesService.count(),
    ]);

    return {
      items,
      meta: buildPaginationMeta(page, limit, totalItems),
      count: items.length,
    };
  }

  @Query(() => Article, {
    name: 'article',
    description: 'Получить одну статью по идентификатору.',
  })
  findOne(@Args('id', { type: () => ID, description: 'Идентификатор статьи.' }) id: string) {
    return this.articlesService.findOne(id);
  }

  @Query(() => ArticleConnection, {
    description: 'Получить статьи по теме с пагинацией.',
    complexity: ({ args, childComplexity }) => (args.limit ?? 10) * childComplexity,
  })
  async articlesByTopic(
    @Args('topicId', { type: () => ID, description: 'Идентификатор темы.' }) topicId: string,
    @Args('page', { type: () => Int, nullable: true, description: 'Номер страницы.' }) page = 1,
    @Args('limit', { type: () => Int, nullable: true, description: 'Размер страницы.' }) limit = 10,
  ): Promise<ArticleConnection> {
    const { skip, take } = paginationArgsToPrisma({ page, limit });
    const [items, totalItems] = await Promise.all([
      this.articlesService.findByTopicPaginated(topicId, skip, take),
      this.articlesService.countByTopic(topicId),
    ]);

    return {
      items,
      meta: buildPaginationMeta(page, limit, totalItems),
      count: items.length,
    };
  }

  @Query(() => ArticleConnection, {
    description: 'Получить статьи по автору с пагинацией.',
    complexity: ({ args, childComplexity }) => (args.limit ?? 10) * childComplexity,
  })
  async articlesByAuthor(
    @Args('authorId', { type: () => ID, description: 'Идентификатор автора.' }) authorId: string,
    @Args('page', { type: () => Int, nullable: true, description: 'Номер страницы.' }) page = 1,
    @Args('limit', { type: () => Int, nullable: true, description: 'Размер страницы.' }) limit = 10,
  ): Promise<ArticleConnection> {
    const { skip, take } = paginationArgsToPrisma({ page, limit });
    const [items, totalItems] = await Promise.all([
      this.articlesService.findByAuthorPaginated(authorId, skip, take),
      this.articlesService.countByAuthor(authorId),
    ]);

    return {
      items,
      meta: buildPaginationMeta(page, limit, totalItems),
      count: items.length,
    };
  }

  @Mutation(() => Article, {
    description: 'Создать новую статью.',
  })
  createArticle(@Args('input', { description: 'Данные новой статьи.' }) input: CreateArticleInput) {
    return this.articlesService.create(input);
  }

  @Mutation(() => Article, {
    description: 'Изменить существующую статью.',
  })
  updateArticle(@Args('input', { description: 'Новые данные статьи.' }) input: UpdateArticleInput) {
    const { id, ...dto } = input;
    return this.articlesService.update(id, dto);
  }

  @Mutation(() => Article, {
    description: 'Опубликовать статью.',
  })
  publishArticle(
    @Args('id', { type: () => ID, description: 'Идентификатор статьи.' }) id: string,
  ) {
    return this.articlesService.update(id, {
      status: ArticleStatus.PUBLISHED,
      publishedAt: new Date().toISOString(),
    });
  }

  @Mutation(() => Article, {
    description: 'Вернуть статью в черновик.',
  })
  moveArticleToDraft(
    @Args('id', { type: () => ID, description: 'Идентификатор статьи.' }) id: string,
  ) {
    return this.articlesService.update(id, {
      status: ArticleStatus.DRAFT,
    });
  }

  @Mutation(() => Article, {
    description: 'Архивировать статью.',
  })
  archiveArticle(
    @Args('id', { type: () => ID, description: 'Идентификатор статьи.' }) id: string,
  ) {
    return this.articlesService.update(id, {
      status: ArticleStatus.ARCHIVED,
    });
  }

  @Mutation(() => Article, {
    description: 'Удалить статью.',
  })
  deleteArticle(@Args('id', { type: () => ID, description: 'Идентификатор статьи.' }) id: string) {
    return this.articlesService.remove(id);
  }

  @ResolveField(() => User, {
    name: 'author',
    description: 'Получить автора статьи.',
  })
  async author(@Parent() article: Article): Promise<User> {
    if (article.author) {
      return article.author;
    }
    return this.usersService.findOne(article.authorId);
  }

  @ResolveField(() => Topic, {
    name: 'topic',
    description: 'Получить тему статьи.',
  })
  async topic(@Parent() article: Article): Promise<Topic> {
    if (article.topic) {
      return article.topic;
    }
    return this.topicsService.findOne(article.topicId);
  }
}
