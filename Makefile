PORT ?= 3000

setup: install

install:
	npm ci

start:
	npx fastify start server/plugin.js -a 0.0.0.0 -p $(PORT) -l info
