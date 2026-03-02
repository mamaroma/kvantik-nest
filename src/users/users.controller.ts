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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Render('users/list')
    async list(@Query() query: { auth?: string; user?: string }) {
        const users = await this.usersService.findAll();
        return {
            pageTitle: 'Квантик — Пользователи',
            activePage: 'users',
            session: sessionFromQuery(query),
            users,
        };
    }

    @Get('add')
    @Render('users/form')
    addForm(@Query() query: { auth?: string; user?: string }) {
        return {
            pageTitle: 'Квантик — Добавить пользователя',
            activePage: 'users',
            session: sessionFromQuery(query),
            mode: 'create',
            roles: Object.values(UserRole),
            user: { email: '', name: '', role: UserRole.READER },
        };
    }

    @Post()
    async create(
        @Body() dto: CreateUserDto,
        @Query() query: { auth?: string; user?: string },
        @Res() res: Response,
    ) {
        const created = await this.usersService.create(dto);
        const q = new URLSearchParams();
        if (query.auth) q.set('auth', query.auth);
        if (query.user) q.set('user', query.user);
        return res.redirect(`/users/${created.id}${q.toString() ? `?${q.toString()}` : ''}`);
    }

    @Get(':id')
    @Render('users/detail')
    async detail(@Param('id') id: string, @Query() query: { auth?: string; user?: string }) {
        const user = await this.usersService.findOne(id);
        return {
            pageTitle: 'Квантик — Пользователь',
            activePage: 'users',
            session: sessionFromQuery(query),
            user,
        };
    }

    @Get(':id/edit')
    @Render('users/form')
    async editForm(@Param('id') id: string, @Query() query: { auth?: string; user?: string }) {
        const user = await this.usersService.findOne(id);
        return {
            pageTitle: 'Квантик — Редактировать пользователя',
            activePage: 'users',
            session: sessionFromQuery(query),
            mode: 'edit',
            roles: Object.values(UserRole),
            user,
        };
    }

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
        @Query() query: { auth?: string; user?: string },
        @Res() res: Response,
    ) {
        await this.usersService.update(id, dto);
        const q = new URLSearchParams();
        if (query.auth) q.set('auth', query.auth);
        if (query.user) q.set('user', query.user);
        return res.redirect(`/users/${id}${q.toString() ? `?${q.toString()}` : ''}`);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Query() query: { auth?: string; user?: string }, @Res() res: Response) {
        await this.usersService.remove(id);
        const q = new URLSearchParams();
        if (query.auth) q.set('auth', query.auth);
        if (query.user) q.set('user', query.user);
        return res.redirect(`/users${q.toString() ? `?${q.toString()}` : ''}`);
    }
}
