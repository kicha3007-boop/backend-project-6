import { asc, eq } from "drizzle-orm";
import { z } from "zod";
import { isUniqueViolation, parseWith, ValidationError } from "./validation.js";

const nameSchema = z.object({ name: z.string().trim().min(1) });

const rethrowUnique = (error) => {
  if (isUniqueViolation(error)) {
    throw new ValidationError({ name: ["Name already taken"] });
  }
  throw error;
};

// Статусы и метки устроены одинаково: справочник с уникальным именем.
// isUsed(id) говорит, связана ли запись с задачами — тогда её удалять нельзя.
export default (db, table, isUsed) => ({
  list: () => db.select().from(table).orderBy(asc(table.id)),

  find: async (id) => {
    const [record] = await db
      .select()
      .from(table)
      .where(eq(table.id, Number(id)));
    return record;
  },

  create: async (data) => {
    const [record] = await db
      .insert(table)
      .values(parseWith(nameSchema, data))
      .returning()
      .catch(rethrowUnique);
    return record;
  },

  update: async (id, data) => {
    const [record] = await db
      .update(table)
      .set(parseWith(nameSchema, data))
      .where(eq(table.id, Number(id)))
      .returning()
      .catch(rethrowUnique);
    return record;
  },

  isUsed: (id) => isUsed(Number(id)),

  remove: (id) => db.delete(table).where(eq(table.id, Number(id))),
});
