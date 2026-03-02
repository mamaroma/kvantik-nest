// Минимальный "slugify" без внешних зависимостей.
// Разрешаем буквы/цифры любых языков (включая кириллицу).
export function slugify(input: string): string {
    const s = (input ?? '').trim().toLowerCase();
    if (!s) return '';
    return s
        .replace(/[^\p{L}\p{N}]+/gu, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
