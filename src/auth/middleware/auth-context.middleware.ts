import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AUTH_OPTIONS } from '../auth.constants';
import { AuthModuleOptions } from '../auth.interfaces';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthContextMiddleware implements NestMiddleware {
    constructor(
        private readonly authService: AuthService,
        @Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions,
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const cookies = Object.fromEntries(
            (req.headers.cookie || '')
                .split(';')
                .map((part) => part.trim())
                .filter(Boolean)
                .map((part) => {
                    const idx = part.indexOf('=');
                    return [part.slice(0, idx), decodeURIComponent(part.slice(idx + 1))];
                }),
        );
        const token = cookies[this.options.cookieName];
        const user = token ? await this.authService.validateToken(token) : null;

        req.authUser = user ?? undefined;
        res.locals.authUser = user ?? undefined;
        res.locals.session = user
            ? { isAuthed: true, user: user.name, email: user.email, role: user.role, userId: user.id }
            : { isAuthed: false };

        next();
    }
}
