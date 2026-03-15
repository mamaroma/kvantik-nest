import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import { ROLES_KEY } from '../auth.constants';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles?.length) return true;

        const req = context.switchToHttp().getRequest();
        const user = req.authUser;

        if (!user) {
            throw new ForbiddenException('Пользователь не аутентифицирован');
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('Недостаточно прав для выполнения операции');
        }

        return true;
    }
}
