# Менеджер задач (JS)

[![hexlet-check](https://github.com/kicha3007-boop/backend-project-6/actions/workflows/hexlet-check.yml/badge.svg)](https://github.com/kicha3007-boop/backend-project-6/actions)
[![CI](https://github.com/kicha3007-boop/backend-project-6/actions/workflows/main.yml/badge.svg)](https://github.com/kicha3007-boop/backend-project-6/actions/workflows/main.yml)

Система управления задачами в духе Redmine: регистрация и вход, задачи с исполнителями, статусы,
метки (многие ко многим) и фильтр задач по статусу, исполнителю, метке и автору.

Учебный проект Хекслета: https://ru.hexlet.io/programs/nodejs

## Стек

Fastify (архитектура шаблона [fastify-nodejs-application](https://github.com/hexlet-boilerplates/fastify-nodejs-application):
приложение — плагин, `@fastify/passport` + secure-session, переопределение метода формы, именованные
маршруты), шаблоны Eta, i18next, Drizzle ORM + PostgreSQL, Tailwind CSS (сборка Vite),
коллектор ошибок по протоколу Sentry (Bugsink).

## Требования

- Node.js 22 или новее
- npm, make
- PostgreSQL (необязательно: без `DATABASE_URL` приложение берёт встроенный PGlite)

## Установка и запуск

```bash
git clone https://github.com/kicha3007-boop/backend-project-6.git
cd backend-project-6
make setup        # .env из .env.example, зависимости, сборка стилей
make start        # http://localhost:3000
```

Настройки — в `.env` (образец `.env.example`):

| Переменная | Назначение |
|---|---|
| `DATABASE_URL` | строка подключения к PostgreSQL; без неё — PGlite в каталоге `PGLITE_DATA_DIR` |
| `SESSION_KEY` | секрет сессионной куки, не короче 32 символов |
| `SENTRY_DSN` | DSN коллектора ошибок (Bugsink/Sentry), необязательно |
| `LOCALE` | язык интерфейса, по умолчанию `ru` |

Схема базы создаётся миграциями Drizzle (`drizzle/`) при старте приложения; новая миграция после
правки `server/db/schema.js` — `make db-generate`.

## Разработка

```bash
make dev             # сервер с перезапуском при изменениях
npx vite build --watch   # пересборка стилей Tailwind
make test            # vitest, у каждого теста своя база PGlite в памяти
make test-coverage
make lint            # oxlint + проверка форматирования oxfmt
```
