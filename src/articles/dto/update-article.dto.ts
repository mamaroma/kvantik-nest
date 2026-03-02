import { ArticleStatus } from '@prisma/client';

export class UpdateArticleDto {
    title?: string;
    slug?: string;
    summary?: string;
    content?: string;
    status?: ArticleStatus;
    publishedAt?: string;
    authorId?: string;
    topicId?: string;
}
