import { ConflictException, Inject, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { createHmac } from 'node:crypto';
import { hashPassword, verifyPassword } from '../common/password';
import { PrismaService } from '../prisma/prisma.service';
import { AUTH_OPTIONS } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthenticatedUser, AuthModuleOptions } from './auth.interfaces';

@Injectable()
export class AuthService implements OnModuleInit {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions,
    ) {}

    async onModuleInit() {
        await this.ensureDefaultAccounts();
    }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email.trim() } });
        if (existing) {
            throw new ConflictException('Пользователь с таким email уже существует');
        }

        const user = await this.prisma.user.create({
            data: {
                email: dto.email.trim(),
                name: dto.name.trim(),
                role: dto.role ?? UserRole.READER,
                passwordHash: hashPassword(dto.password),
            },
        });

        return this.toAuthUser(user);
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email.trim() } });
        if (!user?.passwordHash || !verifyPassword(dto.password, user.passwordHash)) {
            throw new UnauthorizedException('Неверный email или пароль');
        }

        return this.toAuthUser(user);
    }

    issueToken(user: AuthenticatedUser) {
        const exp = Date.now() + this.options.cookieMaxAgeMs;
        const payload = Buffer.from(JSON.stringify({ ...user, exp }), 'utf8').toString('base64url');
        const signature = createHmac('sha256', this.options.jwtSecret).update(payload).digest('base64url');
        return `${payload}.${signature}`;
    }

    async validateToken(token: string): Promise<AuthenticatedUser | null> {
        try {
            const [payload, signature] = token.split('.');
            if (!payload || !signature) return null;

            const expected = createHmac('sha256', this.options.jwtSecret).update(payload).digest('base64url');
            if (expected !== signature) return null;

            const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AuthenticatedUser & { exp: number };
            if (!parsed.exp || parsed.exp < Date.now()) return null;

            const user = await this.prisma.user.findUnique({ where: { id: parsed.id } });
            return user ? this.toAuthUser(user) : null;
        } catch {
            return null;
        }
    }

    async ensureDefaultAccounts() {
        const defaults = [
            { email: 'admin@kvantik.local', name: 'Администратор', role: UserRole.ADMIN, password: 'admin123' },
            { email: 'author@kvantik.local', name: 'Автор по умолчанию', role: UserRole.AUTHOR, password: 'author123' },
            { email: 'reader@kvantik.local', name: 'Читатель', role: UserRole.READER, password: 'reader123' },
        ];

        for (const account of defaults) {
            const existing = await this.prisma.user.findUnique({ where: { email: account.email } });
            if (existing) {
                if (!existing.passwordHash || !existing.passwordHash.includes(':')) {
                    await this.prisma.user.update({
                        where: { id: existing.id },
                        data: {
                            name: account.name,
                            role: account.role,
                            passwordHash: hashPassword(account.password),
                        },
                    });
                }
                continue;
            }
            await this.prisma.user.create({
                data: {
                    email: account.email,
                    name: account.name,
                    role: account.role,
                    passwordHash: hashPassword(account.password),
                },
            });
        }
    }

    private toAuthUser(user: { id: string; email: string; name: string; role: UserRole }) {
        return { id: user.id, email: user.email, name: user.name, role: user.role } satisfies AuthenticatedUser;
    }
}
