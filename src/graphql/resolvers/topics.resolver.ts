import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { TopicsService } from '../../topics/topics.service';
import { ArticlesService } from '../../articles/articles.service';
import { buildPaginationMeta } from '../../common/pagination/pagination-meta.dto';
import { paginationArgsToPrisma, PaginationArgs } from '../inputs/pagination.args';
import { CreateTopicInput, UpdateTopicInput } from '../inputs/topic.inputs';
import { Article } from '../types/article.type';
import { Topic, TopicConnection } from '../types/topic.type';

@Resolver(() => Topic)
export class TopicsResolver {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly articlesService: ArticlesService,
  ) {}

  @Query(() => TopicConnection, {
    name: 'topics',
    description: 'Получить список тем с пагинацией.',
    complexity: ({ args, childComplexity }) => (args.limit ?? 10) * childComplexity,
  })
  async findAll(@Args() args: PaginationArgs): Promise<TopicConnection> {
    const { page, limit, skip, take } = paginationArgsToPrisma(args);
    const [items, totalItems] = await Promise.all([
      this.topicsService.findManyPaginated(skip, take),
      this.topicsService.count(),
    ]);

    return {
      items,
      meta: buildPaginationMeta(page, limit, totalItems),
      count: items.length,
    };
  }

  @Query(() => Topic, {
    name: 'topic',
    description: 'Получить одну тему по идентификатору.',
  })
  findOne(@Args('id', { type: () => ID, description: 'Идентификатор темы.' }) id: string) {
    return this.topicsService.findOne(id);
  }

  @Mutation(() => Topic, {
    description: 'Создать новую тему.',
  })
  createTopic(@Args('input', { description: 'Данные новой темы.' }) input: CreateTopicInput) {
    return this.topicsService.create(input);
  }

  @Mutation(() => Topic, {
    description: 'Изменить существующую тему.',
  })
  updateTopic(@Args('input', { description: 'Новые данные темы.' }) input: UpdateTopicInput) {
    const { id, ...dto } = input;
    return this.topicsService.update(id, dto);
  }

  @Mutation(() => Topic, {
    description: 'Удалить тему.',
  })
  deleteTopic(@Args('id', { type: () => ID, description: 'Идентификатор темы.' }) id: string) {
    return this.topicsService.remove(id);
  }

  @ResolveField(() => [Article], {
    name: 'articles',
    description: 'Получить статьи указанной темы.',
  })
  async articles(@Parent() topic: Topic): Promise<Article[]> {
    return this.articlesService.findByTopicPaginated(topic.id, 0, 20);
  }
}
