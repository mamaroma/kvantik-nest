# Что добавлено для ЛР4

- REST API контроллеры:
  - `src/articles/api/articles-api.controller.ts`
  - `src/topics/api/topics-api.controller.ts`
  - `src/users/api/users-api.controller.ts`
- Валидация DTO через `ValidationPipe` + `class-validator`
- Глобальный `ExceptionFilter`
- Пагинация (`page`, `limit`) + заголовок `Link`
- Swagger / OpenAPI по адресу `/api/docs`
- Вложенные REST-маршруты:
  - `/api/topics/:id/articles`
  - `/api/topics/:id/articles/:articleId`
  - `/api/users/:id/articles`
  - `/api/users/:id/articles/:articleId`
  - `/api/articles/:id/author`
  - `/api/articles/:id/topic`

## После распаковки проекта

Так как архив был собран без обновлённого `node_modules`, нужно выполнить:

```bash
npm install
npm run build
npm run start:dev
```

Swagger будет доступен на:

- `http://localhost:3000/api/docs`
