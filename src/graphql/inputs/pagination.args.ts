import { ArgsType, Field, Int } from '@nestjs/graphql';
import { Max, Min } from 'class-validator';

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, {
    defaultValue: 1,
    description: 'Номер страницы для постраничного вывода.',
  })
  @Min(1)
  page = 1;

  @Field(() => Int, {
    defaultValue: 10,
    description: 'Количество элементов на одной странице.',
  })
  @Min(1)
  @Max(50)
  limit = 10;
}

export function paginationArgsToPrisma(args: PaginationArgs) {
  const page = args.page ?? 1;
  const limit = args.limit ?? 10;

  return {
    page,
    limit,
    skip: (page - 1) * limit,
    take: limit,
  };
}
