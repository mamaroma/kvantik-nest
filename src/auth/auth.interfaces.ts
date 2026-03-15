import { UserRole } from '@prisma/client';

export interface AuthModuleOptions {
    jwtSecret: string;
    jwtExpiresIn: string;
    cookieName: string;
    cookieMaxAgeMs: number;
    cookieSecure: boolean;
    cookieSameSite: 'lax' | 'strict' | 'none';
    loginPath: string;
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    name: string;
    role: UserRole;
}
