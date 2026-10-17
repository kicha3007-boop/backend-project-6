import { relations } from "drizzle-orm";
import { integer, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pgTable("users", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordDigest: varchar("password_digest", { length: 255 }).notNull(),
  ...timestamps,
});

export const statuses = pgTable("statuses", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  ...timestamps,
});

export const labels = pgTable("labels", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 255 }).notNull().unique(),
  ...timestamps,
});

// Внешние ключи без каскада: связанные статус, метку и пользователя база удалить не даст
export const tasks = pgTable("tasks", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  statusId: integer("status_id")
    .notNull()
    .references(() => statuses.id),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  executorId: integer("executor_id").references(() => users.id),
  ...timestamps,
});

export const tasksToLabels = pgTable(
  "tasks_labels",
  {
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    labelId: integer("label_id")
      .notNull()
      .references(() => labels.id),
  },
  (table) => [primaryKey({ columns: [table.taskId, table.labelId] })],
);

export const usersRelations = relations(users, ({ many }) => ({
  createdTasks: many(tasks, { relationName: "creator" }),
  executedTasks: many(tasks, { relationName: "executor" }),
}));

export const statusesRelations = relations(statuses, ({ many }) => ({
  tasks: many(tasks),
}));

export const labelsRelations = relations(labels, ({ many }) => ({
  tasksToLabels: many(tasksToLabels),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  status: one(statuses, { fields: [tasks.statusId], references: [statuses.id] }),
  creator: one(users, {
    fields: [tasks.creatorId],
    references: [users.id],
    relationName: "creator",
  }),
  executor: one(users, {
    fields: [tasks.executorId],
    references: [users.id],
    relationName: "executor",
  }),
  tasksToLabels: many(tasksToLabels),
}));

export const tasksToLabelsRelations = relations(tasksToLabels, ({ one }) => ({
  task: one(tasks, { fields: [tasksToLabels.taskId], references: [tasks.id] }),
  label: one(labels, { fields: [tasksToLabels.labelId], references: [labels.id] }),
}));
