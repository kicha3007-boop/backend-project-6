import { ValidationError } from "../models/validation.js";

// Ресурсный контроллер справочника (статусы, метки): список, создание, правка, удаление.
// Имена маршрутов как в rails: statuses, newStatus, editStatus, status.
export default (app, { resource, single, model }) => {
  const capitalized = single[0].toUpperCase() + single.slice(1);
  const names = {
    index: resource,
    new: `new${capitalized}`,
    edit: `edit${capitalized}`,
    member: single,
  };
  const view = (name) => `${resource}/${name}`;
  const flash = (action, result) => app.t(`flash.${resource}.${action}.${result}`);
  const signedIn = { preHandler: app.requireSignedIn };

  app.get(`/${resource}`, { name: names.index, ...signedIn }, async (_req, reply) =>
    reply.render(view("index"), { records: await model.list() }),
  );

  app.get(`/${resource}/new`, { name: names.new, ...signedIn }, (_req, reply) =>
    reply.render(view("new"), { record: {} }),
  );

  app.post(`/${resource}`, signedIn, async (req, reply) => {
    const data = req.body?.data ?? {};
    try {
      await model.create(data);
      req.flash("info", flash("create", "success"));
      return reply.redirect(app.reverse(names.index));
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
      req.flash("error", flash("create", "error"));
      return reply.code(422).render(view("new"), { record: data, errors: error.errors });
    }
  });

  app.get(`/${resource}/:id/edit`, { name: names.edit, ...signedIn }, async (req, reply) => {
    const record = await model.find(req.params.id);
    if (!record) {
      throw app.httpErrors.notFound();
    }
    return reply.render(view("edit"), { record });
  });

  app.patch(`/${resource}/:id`, { name: names.member, ...signedIn }, async (req, reply) => {
    const data = req.body?.data ?? {};
    try {
      await model.update(req.params.id, data);
      req.flash("info", flash("update", "success"));
      return reply.redirect(app.reverse(names.index));
    } catch (error) {
      if (!(error instanceof ValidationError)) {
        throw error;
      }
      req.flash("error", flash("update", "error"));
      return reply
        .code(422)
        .render(view("edit"), { record: { ...data, id: req.params.id }, errors: error.errors });
    }
  });

  app.delete(`/${resource}/:id`, signedIn, async (req, reply) => {
    if (await model.isUsed(req.params.id)) {
      req.flash("error", flash("delete", "error"));
      return reply.redirect(app.reverse(names.index));
    }
    await model.remove(req.params.id);
    req.flash("info", flash("delete", "success"));
    return reply.redirect(app.reverse(names.index));
  });
};
