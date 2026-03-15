import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    const derived = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
    const [salt, original] = storedHash.split(':');
    if (!salt || !original) return false;

    const derived = scryptSync(password, salt, 64);
    const originalBuffer = Buffer.from(original, 'hex');

    if (derived.length !== originalBuffer.length) return false;
    return timingSafeEqual(derived, originalBuffer);
}
