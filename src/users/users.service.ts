import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { hashPassword } from '../common/password';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll() {
        return this.prisma.user.findMany({ orderBy: { createdAt: 'desc' }, omit: { passwordHash: true } });
    }

    async findManyPaginated(skip: number, take: number) {
        return this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            skip,
            take,
            omit: { passwordHash: true },
        });
    }

    async count() {
        return this.prisma.user.count();
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id }, omit: { passwordHash: true } });
        if (!user) throw new NotFoundException('Пользователь не найден');
        return user;
    }

    async create(dto: CreateUserDto) {
        return this.prisma.user.create({
            data: {
                email: dto.email.trim(),
                name: dto.name.trim(),
                role: dto.role ?? UserRole.READER,
                passwordHash: hashPassword(dto.password),
            },
            omit: { passwordHash: true },
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
                passwordHash: dto.password ? hashPassword(dto.password) : undefined,
            },
            omit: { passwordHash: true },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.user.delete({ where: { id }, omit: { passwordHash: true } });
    }

    async ensureDefaultAuthor() {
        const exists = await this.prisma.user.findFirst({ where: { role: UserRole.AUTHOR } });
        if (exists) {
            if (!exists.passwordHash || !exists.passwordHash.includes(':')) {
                await this.prisma.user.update({
                    where: { id: exists.id },
                    data: { passwordHash: hashPassword('author123') },
                });
            }
            return this.findOne(exists.id);
        }
        return this.prisma.user.create({
            data: {
                email: 'author@kvantik.local',
                name: 'Автор по умолчанию',
                role: UserRole.AUTHOR,
                passwordHash: hashPassword('author123'),
            },
            omit: { passwordHash: true },
        });
    }
}
