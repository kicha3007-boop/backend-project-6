import { and, desc, eq, exists } from "drizzle-orm";
import { z } from "zod";
import { tasks, tasksToLabels } from "../db/schema.js";
import { parseWith } from "./validation.js";

const optionalId = z.preprocess(
  (value) => (value === "" || value === undefined || value === null ? null : value),
  z.coerce.number().int().positive().nullable(),
);

const taskSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().default(""),
  statusId: z.coerce.number().int().positive(),
  executorId: optionalId,
  // Один выбранный вариант select приходит строкой, несколько — массивом
  labels: z.preprocess(
    (value) => [value ?? []].flat().filter(Boolean),
    z.array(z.coerce.number().int().positive()),
  ),
});

const withRelations = {
  status: true,
  creator: true,
  executor: true,
  tasksToLabels: { with: { label: true } },
};

const present = (task) =>
  task && {
    ...task,
    labels: task.tasksToLabels.map(({ label }) => label),
  };

export default (db) => {
  // Условия фильтра собираются запросом к базе: статус, исполнитель, метка, свои задачи
  const buildFilter = (filter, currentUserId) =>
    and(
      filter.status ? eq(tasks.statusId, Number(filter.status)) : undefined,
      filter.executor ? eq(tasks.executorId, Number(filter.executor)) : undefined,
      filter.label
        ? exists(
            db
              .select()
              .from(tasksToLabels)
              .where(
                and(
                  eq(tasksToLabels.taskId, tasks.id),
                  eq(tasksToLabels.labelId, Number(filter.label)),
                ),
              ),
          )
        : undefined,
      filter.isCreatorUser && currentUserId ? eq(tasks.creatorId, currentUserId) : undefined,
    );

  const replaceLabels = async (tx, taskId, labelIds) => {
    await tx.delete(tasksToLabels).where(eq(tasksToLabels.taskId, taskId));
    if (labelIds.length > 0) {
      await tx.insert(tasksToLabels).values(labelIds.map((labelId) => ({ taskId, labelId })));
    }
  };

  return {
    // Связанные статус, авторы и метки приходят одним запросом
    list: async (filter = {}, currentUserId = null) => {
      const rows = await db.query.tasks.findMany({
        where: buildFilter(filter, currentUserId),
        with: withRelations,
        orderBy: desc(tasks.id),
      });
      return rows.map(present);
    },

    find: async (id) =>
      present(
        await db.query.tasks.findFirst({ where: eq(tasks.id, Number(id)), with: withRelations }),
      ),

    create: (data, creatorId) => {
      const { labels: labelIds, ...fields } = parseWith(taskSchema, data);
      return db.transaction(async (tx) => {
        const [task] = await tx
          .insert(tasks)
          .values({ ...fields, creatorId })
          .returning();
        await replaceLabels(tx, task.id, labelIds);
        return task;
      });
    },

    update: (id, data) => {
      const { labels: labelIds, ...fields } = parseWith(taskSchema, data);
      return db.transaction(async (tx) => {
        const [task] = await tx
          .update(tasks)
          .set(fields)
          .where(eq(tasks.id, Number(id)))
          .returning();
        await replaceLabels(tx, task.id, labelIds);
        return task;
      });
    },

    remove: (id) => db.delete(tasks).where(eq(tasks.id, Number(id))),

    hasStatus: async (statusId) =>
      Boolean(await db.query.tasks.findFirst({ where: eq(tasks.statusId, statusId) })),

    hasLabel: async (labelId) => {
      const [link] = await db
        .select()
        .from(tasksToLabels)
        .where(eq(tasksToLabels.labelId, labelId))
        .limit(1);
      return Boolean(link);
    },
  };
};
