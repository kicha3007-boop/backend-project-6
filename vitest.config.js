import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // База каждого теста — PGlite в памяти, а не PostgreSQL из окружения
    env: { DATABASE_URL: "", PGLITE_DATA_DIR: "", SENTRY_DSN: "", LOCALE: "ru" },
    testTimeout: 30_000,
    hookTimeout: 30_000,
    coverage: {
      provider: "v8",
      include: ["server/**"],
      thresholds: { lines: 80 },
    },
  },
});
