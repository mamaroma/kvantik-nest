import { registerEnumType } from '@nestjs/graphql';
import { ArticleStatus, UserRole } from '@prisma/client';

registerEnumType(UserRole, {
  name: 'UserRole',
  description: 'Роль пользователя в системе журнала «Квантик».',
});

registerEnumType(ArticleStatus, {
  name: 'ArticleStatus',
  description: 'Жизненный цикл статьи в редакционной системе.',
});

export { UserRole, ArticleStatus };
