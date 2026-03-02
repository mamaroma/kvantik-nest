import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Render,
    Res,
} from '@nestjs/common';
import { Response } from 'express';
import { sessionFromQuery } from '../common/session';
import { TopicsService } from './topics.service';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';

@Controller('topics')
export class TopicsController {
    constructor(private readonly topicsService: TopicsService) {}

    @Get()
    @Render('topics/list')
    async list(@Query() query: { auth?: string; user?: string }) {
        const topics = await this.topicsService.findAll();
        return {
            pageTitle: 'Квантик — Темы',
            activePage: 'topics',
            session: sessionFromQuery(query),
            topics,
        };
    }

    @Get('add')
    @Render('topics/form')
    addForm(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Добавить тему',
            activePage: 'topics',
            session: sessionFromQuery(query),
            mode: 'create',
            topic: { title: '', slug: '', description: '' },
        };
    }

    @Post()
    async create(@Body() dto: CreateTopicDto, @Query() query: { auth?: string; user?: string }, @Res() res: Response) {
        const created = await this.topicsService.create(dto);
        const q = new URLSearchParams();
        if (query.auth) q.set('auth', query.auth);
        if (query.user) q.set('user', query.user);
        return res.redirect(`/topics/${created.id}${q.toString() ? `?${q.toString()}` : ''}`);
    }

    @Get(':id')
    @Render('topics/detail')
    async detail(@Param('id') id: string, @Query() query: { auth?: string; user?: string }) {
        const topic = await this.topicsService.findOne(id);
        return {
            pageTitle: 'Квантик — Тема',
            activePage: 'topics',
            session: sessionFromQuery(query),
            topic,
        };
    }

    @Get(':id/edit')
    @Render('topics/form')
    async editForm(@Param('id') id: string, @Query() query: { auth?: string; user?: string }) {
        const topic = await this.topicsService.findOne(id);
        return {
            pageTitle: 'Квантик — Редактировать тему',
            activePage: 'topics',
            session: sessionFromQuery(query),
            mode: 'edit',
            topic,
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateTopicDto,
        @Query() query: { auth?: string; user?: string },
        @Res() res: Response,
    ) {
        await this.topicsService.update(id, dto);
        const q = new URLSearchParams();
        if (query.auth) q.set('auth', query.auth);
        if (query.user) q.set('user', query.user);
        return res.redirect(`/topics/${id}${q.toString() ? `?${q.toString()}` : ''}`);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Query() query: { auth?: string; user?: string }, @Res() res: Response) {
        await this.topicsService.remove(id);
        const q = new URLSearchParams();
        if (query.auth) q.set('auth', query.auth);
        if (query.user) q.set('user', query.user);
        return res.redirect(`/topics${q.toString() ? `?${q.toString()}` : ''}`);
    }
}
