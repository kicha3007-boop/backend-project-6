import { ValidationError } from "../models/validation.js";

export default (app) => {
  const { users } = app.models;

  // Править и удалять можно только себя: чужую запись — назад к списку с сообщением
  const requireSelf = async (req, reply) => {
    if (Number(req.params.id) !== req.user?.id) {
      req.flash("error", app.t("flash.users.accessError"));
      return reply.redirect(app.reverse("users"));
    }
    return undefined;
  };
  const ownerOnly = { preHandler: [app.requireSignedIn, requireSelf] };

  app.get("/users", { name: "users" }, async (_req, reply) =>
    reply.render("users/index", { users: await users.list() }),
  );

  app.get("/users/new", { name: "newUser" }, (_req, reply) =>
    reply.render("users/new", { user: {} }),
  );

  app.post("/users", async (req, reply) => {
    const data = req.body?.data ?? {};
    try {
      await users.create(data);
      req.flash("info", app.t("flash.users.create.success"));
      return reply.redirect(app.reverse("root"));
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
      req.flash("error", app.t("flash.users.create.error"));
      return reply.code(422).render("users/new", { user: data, errors: error.errors });
    }
  });

  app.get("/users/:id/edit", { name: "editUser", ...ownerOnly }, async (req, reply) =>
    reply.render("users/edit", { user: await users.find(req.params.id) }),
  );

  app.patch("/users/:id", { name: "user", ...ownerOnly }, async (req, reply) => {
    const data = req.body?.data ?? {};
    try {
      await users.update(req.params.id, data);
      req.flash("info", app.t("flash.users.update.success"));
      return reply.redirect(app.reverse("users"));
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
      req.flash("error", app.t("flash.users.update.error"));
      return reply
        .code(422)
        .render("users/edit", { user: { ...data, id: req.params.id }, errors: error.errors });
    }
  });

  app.delete("/users/:id", ownerOnly, async (req, reply) => {
    if (await users.hasTasks(req.params.id)) {
      req.flash("error", app.t("flash.users.delete.error"));
      return reply.redirect(app.reverse("users"));
    }
    await users.remove(req.params.id);
    await req.logOut();
    req.flash("info", app.t("flash.users.delete.success"));
    return reply.redirect(app.reverse("users"));
  });
};
