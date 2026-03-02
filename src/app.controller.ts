import { Controller, Get, Query, Render, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from './prisma/prisma.service';
import { sessionFromQuery } from './common/session';

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaService) {}

    @Get()
    root(@Query() query: { auth?: string; user?: string }, @Res() res: Response) {
        const q = new URLSearchParams();
        if (query.auth) q.set('auth', query.auth);
        if (query.user) q.set('user', query.user);
        const suffix = q.toString() ? `?${q.toString()}` : '';
        return res.redirect(`/html/about.html${suffix}`);
    }

    @Get('mvc')
    @Render('index')
    getIndex(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — научно-популярный журнал',
            activePage: 'index',
            session: sessionFromQuery(query),
            featured: [
                {
                    title: 'Почему небо голубое?',
                    dateISO: '2025-09-01',
                    dateHuman: '1 сентября 2025',
                    readTime: '7 минут чтения',
                    summary: 'Небо голубое из-за рассеяния Рэлея: короткие волны рассеиваются сильнее.',
                    author: 'Н. П. Резонанс',
                },
                {
                    title: 'Как «слышит» ИИ',
                    dateISO: '2025-08-20',
                    dateHuman: '20 августа 2025',
                    readTime: '6 минут чтения',
                    summary: 'Краткий разбор спектрограмм и свёрточных сетей на примере распознавания речи.',
                    author: 'А. Мел',
                },
            ],
        };
    }

    @Get('gallery')
    gallery(@Res() res: Response) {
        return res.redirect('/html/gallery.html');
    }

    @Get('news')
    news(@Res() res: Response) {
        return res.redirect('/html/news.html');
    }

    @Get('table')
    table(@Res() res: Response) {
        return res.redirect('/html/table.html');
    }

    @Get('code')
    code(@Res() res: Response) {
        return res.redirect('/html/code.html');
    }

    @Get('builder')
    builder(@Res() res: Response) {
        return res.redirect('/html/builder.html');
    }

    @Get('about')
    about(@Res() res: Response) {
        return res.redirect('/html/about.html');
    }

    @Get('contacts')
    contacts(@Res() res: Response) {
        return res.redirect('/html/contacts.html');
    }

    @Get('db/ping')
    async dbPing() {
        const rows = await this.prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;
        return { ok: true, now: rows?.[0]?.now ?? null };
    }
}
