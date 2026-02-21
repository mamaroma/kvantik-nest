import { Controller, Get, Query, Render, Res } from '@nestjs/common';
import { Response } from 'express';

function sessionFromQuery(query: { auth?: string; user?: string }) {
    const isAuthed = query.auth === '1' || query.auth === 'true';
    if (!isAuthed) return { isAuthed: false as const };
    return {
        isAuthed: true as const,
        user: query.user?.trim() || 'Гость',
    };
}

@Controller()
export class AppController {
    @Get()
    root(@Query() query: { auth?: string; user?: string }, @Res() res: Response) {
        const q = new URLSearchParams();
        if (query.auth) q.set('auth', query.auth);
        if (query.user) q.set('user', query.user);
        const suffix = q.toString() ? `?${q.toString()}` : '';
        return res.redirect(`/about${suffix}`);
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
                    summary:
                        'Небо голубое из-за рассеяния Рэлея: короткие волны рассеиваются сильнее.',
                    author: 'Н. П. Резонанс',
                },
                {
                    title: 'Как «слышит» ИИ',
                    dateISO: '2025-08-20',
                    dateHuman: '20 августа 2025',
                    readTime: '6 минут чтения',
                    summary:
                        'Краткий разбор спектрограмм и свёрточных сетей на примере распознавания речи.',
                    author: 'А. Мел',
                },
            ],
        };
    }

    @Get('articles')
    @Render('articles')
    getArticles(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Статьи',
            activePage: 'articles',
            session: sessionFromQuery(query),
            articles: [
                {
                    title: 'Почему небо голубое?',
                    dateISO: '2025-09-01',
                    dateHuman: '1 сентября 2025',
                    readTime: '7 минут чтения',
                    text:
                        'Небо голубое из-за рассеяния Рэлея: короткие волны рассеиваются сильнее. Поэтому синий «побеждает».',
                    author: 'Н. П. Резонанс',
                },
                {
                    title: 'Как «слышит» ИИ',
                    dateISO: '2025-08-20',
                    dateHuman: '20 августа 2025',
                    readTime: '6 минут чтения',
                    text:
                        'Краткий разбор спектрограмм и свёрточных сетей на примере распознавания речи.',
                    author: 'А. Мел',
                },
            ],
        };
    }

    @Get('topics')
    @Render('static-page')
    topics(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Темы',
            activePage: 'topics',
            session: sessionFromQuery(query),
            htmlFile: 'topics.html',
        };
    }

    @Get('gallery')
    @Render('static-page')
    gallery(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Галерея',
            activePage: 'gallery',
            session: sessionFromQuery(query),
            htmlFile: 'gallery.html',
        };
    }

    @Get('news')
    @Render('static-page')
    news(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Лента',
            activePage: 'news',
            session: sessionFromQuery(query),
            htmlFile: 'news.html',
        };
    }

    @Get('table')
    @Render('static-page')
    table(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Таблица',
            activePage: 'table',
            session: sessionFromQuery(query),
            htmlFile: 'table.html',
        };
    }

    @Get('code')
    @Render('static-page')
    code(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Код',
            activePage: 'code',
            session: sessionFromQuery(query),
            htmlFile: 'code.html',
        };
    }

    @Get('builder')
    @Render('static-page')
    builder(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Конструктор',
            activePage: 'builder',
            session: sessionFromQuery(query),
            htmlFile: 'builder.html',
        };
    }

    @Get('about')
    @Render('static-page')
    about(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — О нас',
            activePage: 'about',
            session: sessionFromQuery(query),
            htmlFile: 'about.html',
        };
    }

    @Get('contacts')
    @Render('static-page')
    contacts(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Контакты',
            activePage: 'contacts',
            session: sessionFromQuery(query),
            htmlFile: 'contacts.html',
        };
    }
}
