import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const { statusCode, error, message } = this.normalizeException(exception);

        const payload = {
            statusCode,
            error,
            message,
            timestamp: new Date().toISOString(),
            path: request.originalUrl,
        };

        if (request.originalUrl.startsWith('/api/')) {
            response.status(statusCode).json(payload);
            return;
        }

        response.status(statusCode).render('error', {
            pageTitle: `Ошибка ${statusCode}`,
            activePage: null,
            session: null,
            ...payload,
        });
    }

    private normalizeException(exception: unknown) {
        if (exception instanceof HttpException) {
            const statusCode = exception.getStatus();
            const body = exception.getResponse();

            if (typeof body === 'string') {
                return {
                    statusCode,
                    error: HttpStatus[statusCode] ?? 'Error',
                    message: body,
                };
            }

            if (body && typeof body === 'object') {
                const maybeBody = body as Record<string, unknown>;
                return {
                    statusCode,
                    error: String(maybeBody.error ?? HttpStatus[statusCode] ?? 'Error'),
                    message: (maybeBody.message as string | string[]) ?? exception.message,
                };
            }
        }

        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002':
                    return {
                        statusCode: HttpStatus.CONFLICT,
                        error: 'Conflict',
                        message: 'Нарушено ограничение уникальности.',
                    };
                case 'P2003':
                    return {
                        statusCode: HttpStatus.CONFLICT,
                        error: 'Conflict',
                        message: 'Операция нарушает ссылочную целостность данных.',
                    };
                case 'P2025':
                    return {
                        statusCode: HttpStatus.NOT_FOUND,
                        error: 'Not Found',
                        message: 'Запрошенная сущность не найдена.',
                    };
            }
        }

        return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            error: 'Internal Server Error',
            message: 'Внутренняя ошибка сервера.',
        };
    }
}
