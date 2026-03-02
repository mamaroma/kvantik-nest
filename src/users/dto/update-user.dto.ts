import { UserRole } from '@prisma/client';

export class UpdateUserDto {
    email?: string;
    name?: string;
    role?: UserRole;
}
