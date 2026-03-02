import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    }

    async findOne(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async create(dto: CreateUserDto) {
        return this.prisma.user.create({
            data: {
                email: dto.email.trim(),
                name: dto.name.trim(),
                role: dto.role ?? UserRole.READER,
            },
        });
    }

    async update(id: string, dto: UpdateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data: {
                email: dto.email?.trim(),
                name: dto.name?.trim(),
                role: dto.role,
            },
        });
    }

    async remove(id: string) {
        return this.prisma.user.delete({ where: { id } });
    }

    // Удобно для "пустой" базы: создаём автора по умолчанию, чтобы можно было добавить статью.
    async ensureDefaultAuthor() {
        const exists = await this.prisma.user.findFirst({ where: { role: UserRole.AUTHOR } });
        if (exists) return exists;
        return this.prisma.user.create({
            data: {
                email: 'author@kvantik.local',
                name: 'Автор по умолчанию',
                role: UserRole.AUTHOR,
            },
        });
    }
}
