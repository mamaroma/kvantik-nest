# ЛР 7 — что добавлено

## Реализовано
- динамический `AuthModule.register(...)` с конфигурацией из env;
- глобальный `AuthGuard` + `RolesGuard`;
- `@PublicAccess()` для публичных маршрутов;
- middleware для наполнения auth-контекста и middleware-redirect на страницу логина для защищённых MVC-страниц;
- cookie-based аутентификация;
- роли `READER`, `AUTHOR`, `ADMIN`;
- страницы `/auth/login` и `/auth/register`;
- блокировка служебных страниц и методов API по ролям;
- схема авторизации в Swagger (`cookieAuth`), включён CORS с `credentials: true`;
- в шаблоны прокидывается текущая сессия, шапка меняется в зависимости от входа.

## Тестовые аккаунты
- `admin@kvantik.local / admin123`
- `author@kvantik.local / author123`
- `reader@kvantik.local / reader123`

## Env-переменные
- `AUTH_JWT_SECRET`
- `AUTH_JWT_EXPIRES_IN`
- `AUTH_COOKIE_NAME`
- `AUTH_COOKIE_MAX_AGE_MS`
- `AUTH_COOKIE_SECURE`
- `AUTH_COOKIE_SAME_SITE`
- `AUTH_LOGIN_PATH`
- `CORS_ORIGIN`

## Важно
Здесь реализована **локальная cookie-аутентификация внутри приложения**, без внешнего провайдера (не SuperTokens/Auth0/Firebase). Это покрывает требования по guard/middleware/ролям/Swagger/CORS и подходит как учебная реализация.
