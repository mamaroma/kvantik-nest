import { ArticleStatus } from '@prisma/client';

export class CreateArticleDto {
    title!: string;
    slug?: string;
    summary?: string;
    content!: string;
    status?: ArticleStatus;
    publishedAt?: string; // ISO string from form
    authorId!: string;
    topicId!: string;
}
