import { Controller, Get, Render, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaService } from './prisma/prisma.service';
import { PublicAccess } from './auth/decorators/public-access.decorator';
import { sessionFromRequest } from './common/session';

@Controller()
export class AppController {
    constructor(private readonly prisma: PrismaService) {}

    @PublicAccess()
    @Get()
    root(@Res() res: Response) {
        return res.redirect('/mvc');
    }

    @PublicAccess()
    @Get('mvc')
    @Render('index')
    getIndex(@Req() req: Request) {
        return {
            pageTitle: 'Квантик — научно-популярный журнал',
            activePage: 'index',
            session: sessionFromRequest(req),
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

    @PublicAccess()
    @Get('gallery')
    gallery(@Res() res: Response) {
        return res.redirect('/html/gallery.html');
    }

    @PublicAccess()
    @Get('news')
    news(@Res() res: Response) {
        return res.redirect('/html/news.html');
    }

    @PublicAccess()
    @Get('table')
    table(@Res() res: Response) {
        return res.redirect('/html/table.html');
    }

    @PublicAccess()
    @Get('code')
    code(@Res() res: Response) {
        return res.redirect('/html/code.html');
    }

    @PublicAccess()
    @Get('builder')
    builder(@Res() res: Response) {
        return res.redirect('/html/builder.html');
    }

    @PublicAccess()
    @Get('about')
    about(@Res() res: Response) {
        return res.redirect('/html/about.html');
    }

    @PublicAccess()
    @Get('contacts')
    contacts(@Res() res: Response) {
        return res.redirect('/html/contacts.html');
    }

    @PublicAccess()
    @Get('db/ping')
    async dbPing() {
        const rows = await this.prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now`;
        return { ok: true, now: rows?.[0]?.now ?? null };
    }
}
