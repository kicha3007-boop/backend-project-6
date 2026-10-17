import "dotenv/config";
import { randomBytes } from "node:crypto";
import path from "node:path";
import fastifyFormbody from "@fastify/formbody";
import { Authenticator } from "@fastify/passport";
import fastifySecureSession from "@fastify/secure-session";
import fastifySensible from "@fastify/sensible";
import fastifyStatic from "@fastify/static";
import fastifyView from "@fastify/view";
import fastifyMethodOverride from "@hexlet/fastify-method-override";
import * as Sentry from "@sentry/node";
import { Eta } from "eta";
import { plugin as fastifyReverseRoutes, routes as reverseRoutes } from "fastify-reverse-routes";
import i18next from "i18next";
import qs from "qs";
import createDb from "./db/index.js";
import getHelpers from "./helpers/index.js";
import FormStrategy from "./lib/FormStrategy.js";
import en from "./locales/en.js";
import ru from "./locales/ru.js";
import createModels from "./models/index.js";
import addRoutes from "./routes/index.js";

const rootDir = path.join(import.meta.dirname, "..");

// Коллектор ошибок (Bugsink принимает протокол Sentry): включается, если задан SENTRY_DSN
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, environment: process.env.NODE_ENV });
}

const setUpLocalization = async () => {
  const i18n = i18next.createInstance();
  await i18n.init({
    lng: process.env.LOCALE?.split("-").at(0) ?? "ru",
    fallbackLng: "en",
    resources: { ru, en },
  });
  return i18n;
};

const setUpViews = async (app) => {
  await app.register(fastifyView, {
    engine: { eta: new Eta() },
    defaultContext: getHelpers(app),
    templates: path.join(rootDir, "server", "views"),
  });

  app.decorateReply("render", function render(viewPath, locals = {}) {
    return this.view(viewPath, {
      ...locals,
      flash: this.flash(),
      isAuthenticated: this.request.isAuthenticated(),
      currentUser: this.request.user,
    });
  });
};

const setUpAuthentication = async (app) => {
  const passport = new Authenticator();
  passport.registerUserSerializer(async (user) => user.id);
  passport.registerUserDeserializer(async (id) => (await app.models.users.find(id)) ?? null);
  passport.use("form", new FormStrategy("form", app));
  await app.register(passport.initialize());
  await app.register(passport.secureSession());
  app.decorate("passport", passport);

  // Хук для закрытых страниц: гостя отправляем на главную с сообщением
  app.decorate("requireSignedIn", async (req, reply) => {
    if (!req.isAuthenticated()) {
      req.flash("error", app.t("flash.authError"));
      return reply.redirect(app.reverse("root"));
    }
    return undefined;
  });
};

const setUpErrorHandler = (app) => {
  app.setErrorHandler((error, req, reply) => {
    if (process.env.SENTRY_DSN) {
      Sentry.captureException(error);
    }
    req.log.error(error);
    const statusCode = error.statusCode ?? 500;
    // Трассировку наружу не отдаём: только код и текст
    reply
      .code(statusCode)
      .send({ statusCode, message: statusCode < 500 ? error.message : "Internal Server Error" });
  });
};

export const options = {
  exposeHeadRoutes: false,
};

export default async (app, _options) => {
  const { db, close } = await createDb();
  app.decorate("db", db);
  app.decorate("models", createModels(db));
  app.addHook("onClose", close);

  const i18n = await setUpLocalization();
  app.decorate("t", (key, params) => i18n.t(key, params));

  await app.register(fastifySensible);
  await app.register(fastifyReverseRoutes);
  // Имена маршрутов fastify-reverse-routes хранит на уровне модуля: при закрытии приложения
  // их нужно освободить, иначе следующее приложение в том же процессе (тесты) не зарегистрируется
  app.addHook("onClose", async () => reverseRoutes.clear());
  await app.register(fastifyFormbody, { parser: qs.parse });
  await app.register(fastifySecureSession, {
    // Без SESSION_KEY — случайный ключ на время жизни процесса: сессии сбросятся при рестарте
    secret: process.env.SESSION_KEY || randomBytes(32).toString("hex"),
    salt: "task-manager-slt",
    cookie: { path: "/", httpOnly: true },
  });
  await setUpAuthentication(app);
  await app.register(fastifyMethodOverride);
  await setUpViews(app);
  await app.register(fastifyStatic, {
    root: path.join(rootDir, "dist"),
    prefix: "/assets/",
  });
  setUpErrorHandler(app);
  addRoutes(app);

  return app;
};
