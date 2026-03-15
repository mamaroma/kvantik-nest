import { Body, Controller, Delete, Get, Param, Patch, Post, Render, Req, Res } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { PublicAccess } from '../auth/decorators/public-access.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { sessionFromRequest } from '../common/session';
import { CreateTopicDto } from './dto/create-topic.dto';
import { UpdateTopicDto } from './dto/update-topic.dto';
import { TopicsService } from './topics.service';

@Controller('topics')
export class TopicsController {
    constructor(private readonly topicsService: TopicsService) {}

    @PublicAccess()
    @Get()
    @Render('topics/list')
    async list(@Req() req: Request) {
        const topics = await this.topicsService.findAll();
        return {
            pageTitle: 'Квантик — Темы',
            activePage: 'topics',
            session: sessionFromRequest(req),
            topics,
        };
    }

    @Roles(UserRole.ADMIN)
    @Get('add')
    @Render('topics/form')
    addForm(@Req() req: Request) {
        return {
            pageTitle: 'Квантик — Добавить тему',
            activePage: 'topics',
            session: sessionFromRequest(req),
            mode: 'create',
            topic: { title: '', slug: '', description: '' },
        };
    }

    @Roles(UserRole.ADMIN)
    @Post()
    async create(@Body() dto: CreateTopicDto, @Res() res: Response) {
        const created = await this.topicsService.create(dto);
        return res.redirect(`/topics/${created.id}`);
    }

    @PublicAccess()
    @Get(':id')
    @Render('topics/detail')
    async detail(@Param('id') id: string, @Req() req: Request) {
        const topic = await this.topicsService.findOne(id);
        return {
            pageTitle: 'Квантик — Тема',
            activePage: 'topics',
            session: sessionFromRequest(req),
            topic,
        };
    }

    @Roles(UserRole.ADMIN)
    @Get(':id/edit')
    @Render('topics/form')
    async editForm(@Param('id') id: string, @Req() req: Request) {
        const topic = await this.topicsService.findOne(id);
        return {
            pageTitle: 'Квантик — Редактировать тему',
            activePage: 'topics',
            session: sessionFromRequest(req),
            mode: 'edit',
            topic,
        };
    }

    @Roles(UserRole.ADMIN)
    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateTopicDto, @Res() res: Response) {
        await this.topicsService.update(id, dto);
        return res.redirect(`/topics/${id}`);
    }

    @Roles(UserRole.ADMIN)
    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        await this.topicsService.remove(id);
        return res.redirect('/topics');
    }
}
