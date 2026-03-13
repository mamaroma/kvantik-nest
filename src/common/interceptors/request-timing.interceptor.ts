import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class RequestTimingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(RequestTimingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const startedAt = process.hrtime.bigint();

        return next.handle().pipe(
            map((data) => {
                const elapsedMs = this.getElapsedMs(startedAt);
                this.setElapsedHeader(context, elapsedMs);
                this.logRequest(context, elapsedMs);
                return this.attachTemplateTiming(context, data, elapsedMs);
            }),
            tap({
                error: (error) => {
                    const elapsedMs = this.getElapsedMs(startedAt);
                    this.setElapsedHeader(context, elapsedMs);
                    this.logRequest(context, elapsedMs, error);
                },
            }),
        );
    }

    private getElapsedMs(startedAt: bigint) {
        return Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    }

    private formatElapsedMs(elapsedMs: number) {
        return `${elapsedMs.toFixed(2)}ms`;
    }

    private logRequest(context: ExecutionContext, elapsedMs: number, error?: unknown) {
        const label = this.getRequestLabel(context);
        const suffix = `(${this.formatElapsedMs(elapsedMs)})`;

        if (error) {
            this.logger.error(`${label} failed ${suffix}`);
            return;
        }

        this.logger.log(`${label} ${suffix}`);
    }

    private getRequestLabel(context: ExecutionContext) {
        if (context.getType<'http' | 'graphql'>() === 'graphql') {
            const gqlContext = GqlExecutionContext.create(context);
            const info = gqlContext.getInfo();
            const parentType = info?.parentType?.name ?? 'GraphQL';
            const fieldName = info?.fieldName ?? 'unknown';
            return `GraphQL ${parentType}.${fieldName}`;
        }

        const http = context.switchToHttp();
        const request = http.getRequest<Request>();
        const method = request?.method ?? 'HTTP';
        const url = request?.originalUrl ?? request?.url ?? '/';
        return `${method} ${url}`;
    }

    private setElapsedHeader(context: ExecutionContext, elapsedMs: number) {
        const response = this.getResponse(context);
        if (!response || response.headersSent) {
            return;
        }
        response.setHeader('X-Elapsed-Time', this.formatElapsedMs(elapsedMs));
    }

    private getResponse(context: ExecutionContext): Response | undefined {
        if (context.getType<'http' | 'graphql'>() === 'graphql') {
            const gqlContext = GqlExecutionContext.create(context).getContext();
            return gqlContext?.res ?? gqlContext?.reply?.raw ?? gqlContext?.reply;
        }

        return context.switchToHttp().getResponse<Response>();
    }

    private attachTemplateTiming(context: ExecutionContext, data: unknown, elapsedMs: number) {
        if (context.getType<'http'>() !== 'http') {
            return data;
        }

        const request = context.switchToHttp().getRequest<Request>();
        if (!request || request.path.startsWith('/api') || request.path.startsWith('/graphql')) {
            return data;
        }

        if (!this.isPlainObject(data)) {
            return data;
        }

        return {
            ...data,
            serverElapsedTimeMs: Number(elapsedMs.toFixed(2)),
        };
    }

    private isPlainObject(value: unknown): value is Record<string, unknown> {
        return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
    }
}
