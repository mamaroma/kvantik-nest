export type Session =
    | { isAuthed: false }
    | { isAuthed: true; user: string };

// В рамках лабораторных работ аутентификация имитируется через query-параметры.
// Используется во всех MVC-контроллерах, чтобы прокидывать "сессию" в шаблоны.
export function sessionFromQuery(query: { auth?: string; user?: string }): Session {
    const isAuthed = query.auth === '1' || query.auth === 'true';
    if (!isAuthed) return { isAuthed: false };
    return { isAuthed: true, user: query.user?.trim() || 'Гость' };
}
