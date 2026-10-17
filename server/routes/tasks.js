import { ValidationError } from "../models/validation.js";

export default (app) => {
  const { tasks, statuses, labels, users } = app.models;
  const signedIn = { preHandler: app.requireSignedIn };

  // Справочники для селектов формы и фильтра
  const loadOptions = async () => ({
    statuses: await statuses.list(),
    labels: await labels.list(),
    users: await users.list(),
  });

  const renderForm = async (reply, viewName, task, errors, code = 200) =>
    reply.code(code).render(`tasks/${viewName}`, { task, errors, ...(await loadOptions()) });

  // Метки формы приходят строкой (одна) или массивом (несколько)
  const fromForm = (data, id) => ({
    ...data,
    id,
    labelIds: [data.labels ?? []].flat().map(Number),
  });

  app.get("/tasks", { name: "tasks", ...signedIn }, async (req, reply) => {
    const filter = req.query ?? {};
    return reply.render("tasks/index", {
      tasks: await tasks.list(filter, req.user.id),
      filter,
      ...(await loadOptions()),
    });
  });

  app.get("/tasks/new", { name: "newTask", ...signedIn }, (_req, reply) =>
    renderForm(reply, "new", { labelIds: [] }),
  );

  app.post("/tasks", signedIn, async (req, reply) => {
    const data = req.body?.data ?? {};
    try {
      await tasks.create(data, req.user.id);
      req.flash("info", app.t("flash.tasks.create.success"));
      return reply.redirect(app.reverse("tasks"));
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
      req.flash("error", app.t("flash.tasks.create.error"));
      return renderForm(reply, "new", fromForm(data), error.errors, 422);
    }
  });

  app.get("/tasks/:id", { name: "task", ...signedIn }, async (req, reply) => {
    const task = await tasks.find(req.params.id);
    if (!task) {
      throw app.httpErrors.notFound();
    }
    return reply.render("tasks/show", { task });
  });

  app.get("/tasks/:id/edit", { name: "editTask", ...signedIn }, async (req, reply) => {
    const task = await tasks.find(req.params.id);
    if (!task) {
      throw app.httpErrors.notFound();
    }
    return renderForm(reply, "edit", { ...task, labelIds: task.labels.map(({ id }) => id) });
  });

  app.patch("/tasks/:id", signedIn, async (req, reply) => {
    const data = req.body?.data ?? {};
    try {
      await tasks.update(req.params.id, data);
      req.flash("info", app.t("flash.tasks.update.success"));
      return reply.redirect(app.reverse("tasks"));
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
      req.flash("error", app.t("flash.tasks.update.error"));
      return renderForm(reply, "edit", fromForm(data, req.params.id), error.errors, 422);
    }
  });

  // Удалить задачу может только её автор
  app.delete("/tasks/:id", signedIn, async (req, reply) => {
    const task = await tasks.find(req.params.id);
    if (!task) {
      throw app.httpErrors.notFound();
    }
    if (task.creatorId !== req.user.id) {
      req.flash("error", app.t("flash.tasks.delete.error"));
      return reply.redirect(app.reverse("tasks"));
    }
    await tasks.remove(task.id);
    req.flash("info", app.t("flash.tasks.delete.success"));
    return reply.redirect(app.reverse("tasks"));
  });
};
