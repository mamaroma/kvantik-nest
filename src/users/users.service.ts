import { Injectable, NotFoundException } from '@nestjs/common';
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

    async findManyPaginated(skip: number, take: number) {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        });
    }

    async count() {
        return this.prisma.user.count();
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user) {
            throw new NotFoundException('Пользователь не найден');
        }
        return user;
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
        await this.findOne(id);

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
        await this.findOne(id);
        return this.prisma.user.delete({ where: { id } });
    }

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
