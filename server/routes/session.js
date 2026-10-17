export default (app) => {
  app.get("/session/new", { name: "newSession" }, (_req, reply) =>
    reply.render("session/new", { signInForm: {} }),
  );

  app.post(
    "/session",
    { name: "session" },
    app.passport.authenticate("form", async (req, reply, err, user) => {
      if (err) {
        throw err;
      }
      if (!user) {
        req.flash("error", app.t("flash.session.create.error"));
        return reply
          .code(422)
          .render("session/new", { signInForm: { email: req.body?.data?.email } });
      }
      await req.logIn(user);
      req.flash("success", app.t("flash.session.create.success"));
      return reply.redirect(app.reverse("root"));
    }),
  );

  app.delete("/session", async (req, reply) => {
    await req.logOut();
    req.flash("info", app.t("flash.session.delete.success"));
    return reply.redirect(app.reverse("root"));
  });
};
