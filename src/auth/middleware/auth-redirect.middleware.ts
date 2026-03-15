import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AUTH_OPTIONS } from '../auth.constants';
import { AuthModuleOptions } from '../auth.interfaces';

@Injectable()
export class AuthRedirectMiddleware implements NestMiddleware {
    constructor(@Inject(AUTH_OPTIONS) private readonly options: AuthModuleOptions) {}

    use(req: Request, res: Response, next: NextFunction) {
        if (req.authUser) return next();

        const acceptsHtml = typeof req.headers.accept === 'string' && req.headers.accept.includes('text/html');
        if (!acceptsHtml) return next();

        const returnTo = encodeURIComponent(req.originalUrl || '/mvc');
        return res.redirect(`${this.options.loginPath}?returnTo=${returnTo}`);
    }
}
