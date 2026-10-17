PORT ?= 3000

setup: prepare install build

prepare:
	cp -n .env.example .env || true

install:
	npm ci

build:
	npm run build

start:
	npx fastify start server/plugin.js -o -a 0.0.0.0 -p $(PORT) -l info

dev:
	npx fastify start server/plugin.js -o -a 0.0.0.0 -p $(PORT) -l info -w

test:
	npm test

test-coverage:
	npm run test:coverage

lint:
	npx oxlint && npx oxfmt --ignore-path=.oxfmtignore --check

lint-fix:
	npx oxfmt --ignore-path=.oxfmtignore && npx oxlint --fix

db-generate:
	npx drizzle-kit generate

db-migrate:
	node server/db/migrate.js

.PHONY: setup prepare install build start dev test test-coverage lint lint-fix db-generate db-migrate
