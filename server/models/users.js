import { asc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { tasks, users } from "../db/schema.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { isUniqueViolation, parseWith, ValidationError } from "./validation.js";

const userSchema = z.object({
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(3),
});

const toRecord = async ({ password, ...fields }) => ({
  ...fields,
  passwordDigest: await hashPassword(password),
});

const rethrowUnique = (error) => {
  if (isUniqueViolation(error)) {
    throw new ValidationError({ email: ["Email already taken"] });
  }
  throw error;
};

export const fullName = (user) => `${user.firstName} ${user.lastName}`;

export default (db) => ({
  list: () => db.query.users.findMany({ orderBy: asc(users.id) }),

  find: (id) => db.query.users.findFirst({ where: eq(users.id, Number(id)) }),

  findByEmail: (email) =>
    db.query.users.findFirst({
      where: eq(
        users.email,
        String(email ?? "")
          .trim()
          .toLowerCase(),
      ),
    }),

  verifyPassword: (user, password) => verifyPassword(String(password ?? ""), user.passwordDigest),

  create: async (data) => {
    const record = await toRecord(parseWith(userSchema, data));
    const [user] = await db.insert(users).values(record).returning().catch(rethrowUnique);
    return user;
  },

  update: async (id, data) => {
    const record = await toRecord(parseWith(userSchema, data));
    const [user] = await db
      .update(users)
      .set(record)
      .where(eq(users.id, Number(id)))
      .returning()
      .catch(rethrowUnique);
    return user;
  },

  // Пользователя, связанного с задачей (автор или исполнитель), не удаляем
  hasTasks: async (id) => {
    const task = await db.query.tasks.findFirst({
      where: or(eq(tasks.creatorId, Number(id)), eq(tasks.executorId, Number(id))),
    });
    return Boolean(task);
  },

  remove: (id) => db.delete(users).where(eq(users.id, Number(id))),
});
