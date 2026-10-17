import fs from "node:fs/promises";
import path from "node:path";
import fastify from "fastify";
import qs from "qs";
import init from "../../server/plugin.js";

const fixturePath = path.join(import.meta.dirname, "..", "..", "__fixtures__", "testData.json");

export const getTestData = async () => JSON.parse(await fs.readFile(fixturePath, "utf-8"));

// Каждое приложение получает свою базу PGlite в памяти: тесты не зависят друг от друга
export const buildApp = async () => {
  const app = fastify({ exposeHeadRoutes: false, logger: false });
  await init(app);
  await app.ready();
  return app;
};

// Форма уходит как у браузера: application/x-www-form-urlencoded с полями data[...]
const toForm = (data) => qs.stringify({ data }, { arrayFormat: "repeat" });

export const submit = (app, { method = "POST", url, data = {}, cookies }) =>
  app.inject({
    method,
    url,
    payload: toForm(data),
    headers: { "content-type": "application/x-www-form-urlencoded" },
    cookies,
  });

export const signIn = async (app, { email, password }) => {
  const response = await submit(app, { url: "/session", data: { email, password } });
  const [sessionCookie] = response.cookies;
  return { [sessionCookie.name]: sessionCookie.value };
};
