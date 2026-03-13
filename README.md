# Квантик — NestJS + Render

Автор: Арсений Краковский, группа м3306

NestJS-приложение для научно-популярного журнала «Квантик» с MVC (EJS), REST API, GraphQL, Prisma и SSE.

## Что реализовано в ЛР6

### 1) Измерение времени запроса

Добавлен глобальный `RequestTimingInterceptor`.

- Для MVC-страниц серверное время пробрасывается в шаблоны и выводится рядом с клиентским временем в подвале.
- Для REST API и GraphQL время возвращается в заголовке `X-Elapsed-Time`.
- Одновременно время пишется в логи приложения.

### 2) Кэширование

#### Клиентское кэширование REST API

Для GET-эндпоинтов REST API настроены:

- `Cache-Control: public, max-age=60, must-revalidate`
- `ETag` через отдельный глобальный `EtagInterceptor`

Это даёт возможность:

- в течение минуты использовать локальный кэш браузера;
- после истечения `max-age` выполнять условный запрос с `If-None-Match`;
- получать `304 Not Modified`, если ресурс не изменился.

#### Серверное кэширование

Через `CacheModule` настроен in-memory cache для сущности `Topic`.

- TTL: `5000` мс
- кэшируются `findAll`, `findManyPaginated`, `count`, `findOne`
- при создании/изменении/удалении темы кэш очищается

### 3) Загрузка файлов в S3-совместимое хранилище

Добавлен инфраструктурный модуль `StorageModule` на базе AWS SDK v3.

Реализовано:

- загрузка изображения статьи в Yandex Object Storage;
- REST endpoint: `POST /api/articles/:id/media`;
- MVC-форма на странице статьи: `POST /articles/:id/media`;
- валидация файла по типу и размеру (до 5 МБ);
- сохранение ссылки в `MediaAsset`.

## Переменные окружения

Используй `.env.example` как шаблон.

Для Object Storage нужны:

```env
S3_ENDPOINT=https://storage.yandexcloud.net
S3_REGION=ru-central1
S3_BUCKET=your-bucket-name
S3_ACCESS_KEY_ID=your-access-key
S3_SECRET_ACCESS_KEY=your-secret-key
S3_PUBLIC_BASE_URL=https://your-bucket-name.storage.yandexcloud.net
```

Если бакет публичный, `S3_PUBLIC_BASE_URL` удобно указывать как публичный адрес бакета.

## Запуск локально

```bash
npm install
npm run prisma:generate
npm run start:dev
```

Открыть: http://localhost:3000

## Проверка ЛР6

### Проверка времени ответа

- MVC: открой `/mvc` или `/articles` и посмотри подвал страницы.
- REST API: смотри заголовок `X-Elapsed-Time`, например у `/api/articles`.
- GraphQL: выполни запрос на `/graphql` и проверь `X-Elapsed-Time` в HTTP response headers.

### Проверка ETag

Пример:

```bash
curl -i http://localhost:3000/api/topics
curl -i http://localhost:3000/api/topics -H 'If-None-Match: W/"...etag..."'
```

Во втором случае должен прийти `304 Not Modified`, если данные не менялись.

### Проверка server cache

Можно несколько раз подряд дернуть:

```bash
hey -n 20 -c 5 http://localhost:3000/api/topics
```

или просто:

```bash
curl http://localhost:3000/api/topics
```

### Проверка загрузки файла

1. Создай статью.
2. Открой страницу статьи.
3. Загрузи изображение через форму.
4. Убедись, что картинка появилась в блоке `Медиафайлы`.

## Старые части проекта

### ЛР2

- Prisma schema: `prisma/schema.prisma`
- Проверка БД: `GET /db/ping`

### ЛР3

#### CRUD маршруты MVC

Articles

- `GET /articles`
- `GET /articles/:id`
- `GET /articles/add`
- `POST /articles`
- `GET /articles/:id/edit`
- `PATCH /articles/:id`
- `DELETE /articles/:id`

Topics

- `GET /topics`
- `GET /topics/:id`
- `GET /topics/add`
- `POST /topics`
- `GET /topics/:id/edit`
- `PATCH /topics/:id`
- `DELETE /topics/:id`

Users

- `GET /users`
- `GET /users/:id`
- `GET /users/add`
- `POST /users`
- `GET /users/:id/edit`
- `PATCH /users/:id`
- `DELETE /users/:id`

#### SSE

- `GET /articles/sse`
