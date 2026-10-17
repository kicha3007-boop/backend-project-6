import { mkdir } from "node:fs/promises";
import path from "node:path";
import * as schema from "./schema.js";

const migrationsFolder = path.join(import.meta.dirname, "..", "..", "drizzle");

// PostgreSQL по DATABASE_URL; без него — PGlite (тот же PostgreSQL внутри процесса):
// в файле PGLITE_DATA_DIR или в памяти, как в тестах. Схема всегда накатывается миграциями.
const createDb = async (databaseUrl = process.env.DATABASE_URL) => {
  if (databaseUrl) {
    const { default: pg } = await import("pg");
    const { drizzle } = await import("drizzle-orm/node-postgres");
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    const pool = new pg.Pool({ connectionString: databaseUrl });
    const db = drizzle(pool, { schema });
    await migrate(db, { migrationsFolder });
    return { db, close: () => pool.end() };
  }

  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const { migrate } = await import("drizzle-orm/pglite/migrator");
  const dataDir = process.env.PGLITE_DATA_DIR || undefined;
  if (dataDir) {
    await mkdir(dataDir, { recursive: true });
  }
  const client = new PGlite(dataDir);
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder });
  return { db, close: () => client.close() };
};

export default createDb;
