import { Body, Controller, Delete, Get, Param, Patch, Post, Render, Req, Res } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Request, Response } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { sessionFromRequest } from '../common/session';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@Roles(UserRole.ADMIN)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get()
    @Render('users/list')
    async list(@Req() req: Request) {
        const users = await this.usersService.findAll();
        return {
            pageTitle: 'Квантик — Пользователи',
            activePage: 'users',
            session: sessionFromRequest(req),
            users,
        };
    }

    @Get('add')
    @Render('users/form')
    addForm(@Req() req: Request) {
        return {
            pageTitle: 'Квантик — Добавить пользователя',
            activePage: 'users',
            session: sessionFromRequest(req),
            mode: 'create',
            roles: Object.values(UserRole),
            user: { email: '', name: '', role: UserRole.READER },
        };
    }

    @Post()
    async create(@Body() dto: CreateUserDto, @Res() res: Response) {
        const created = await this.usersService.create(dto);
        return res.redirect(`/users/${created.id}`);
    }

    @Get(':id')
    @Render('users/detail')
    async detail(@Param('id') id: string, @Req() req: Request) {
        const user = await this.usersService.findOne(id);
        return {
            pageTitle: 'Квантик — Пользователь',
            activePage: 'users',
            session: sessionFromRequest(req),
            user,
        };
    }

    @Get(':id/edit')
    @Render('users/form')
    async editForm(@Param('id') id: string, @Req() req: Request) {
        const user = await this.usersService.findOne(id);
        return {
            pageTitle: 'Квантик — Редактировать пользователя',
            activePage: 'users',
            session: sessionFromRequest(req),
            mode: 'edit',
            roles: Object.values(UserRole),
            user,
        };
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateUserDto, @Res() res: Response) {
        await this.usersService.update(id, dto);
        return res.redirect(`/users/${id}`);
    }

    @Delete(':id')
    async remove(@Param('id') id: string, @Res() res: Response) {
        await this.usersService.remove(id);
        return res.redirect('/users');
    }
}
