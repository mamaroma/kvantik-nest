import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { createHash } from 'crypto';
import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable()
export class EtagInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        if (context.getType<'http'>() !== 'http') {
            return next.handle();
        }

        const request = context.switchToHttp().getRequest<Request>();
        const response = context.switchToHttp().getResponse<Response>();

        if (!request || !response || request.method !== 'GET' || !request.path.startsWith('/api')) {
            return next.handle();
        }

        return next.handle().pipe(
            mergeMap((data) => {
                if (response.headersSent || data === undefined) {
                    return of(data);
                }

                const payload = JSON.stringify(data);
                const etag = `W/\"${createHash('sha1').update(payload).digest('base64url')}\"`;
                response.setHeader('ETag', etag);

                const ifNoneMatch = request.headers['if-none-match'];
                if (ifNoneMatch === etag) {
                    response.status(304).end();
                    return EMPTY;
                }

                return of(data);
            }),
        );
    }
}
