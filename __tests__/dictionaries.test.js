import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { buildApp, getTestData, signIn, submit } from "./helpers/index.js";

// Статусы и метки — справочники с одинаковым CRUD
describe.each([
  { resource: "statuses", single: "status", edit: "editStatus", create: "newStatus" },
  { resource: "labels", single: "label", edit: "editLabel", create: "newLabel" },
])("$resource", ({ resource, single, edit, create }) => {
  let app;
  let testData;
  let cookies;
  let existing;
  let model;

  beforeEach(async () => {
    app = await buildApp();
    testData = await getTestData();
    model = app.models[resource];
    await app.models.users.create(testData.users.existing);
    cookies = await signIn(app, testData.users.existing);
    existing = await model.create(testData[resource].existing);
  });

  afterEach(async () => {
    await app.close();
  });

  test("index and forms", async () => {
    const index = await app.inject({ url: app.reverse(resource), cookies });
    expect(index.statusCode).toBe(200);
    expect(index.body).toContain(testData[resource].existing.name);
    expect((await app.inject({ url: app.reverse(create), cookies })).statusCode).toBe(200);
    expect(
      (await app.inject({ url: app.reverse(edit, { id: existing.id }), cookies })).statusCode,
    ).toBe(200);
  });

  test("guest is redirected", async () => {
    const response = await app.inject({ url: app.reverse(resource) });
    expect(response.headers.location).toBe(app.reverse("root"));
  });

  test("create", async () => {
    const response = await submit(app, {
      url: app.reverse(resource),
      data: testData[resource].new,
      cookies,
    });
    expect(response.statusCode).toBe(302);
    expect((await model.list()).map(({ name }) => name)).toContain(testData[resource].new.name);
  });

  test("create with empty or taken name", async () => {
    const empty = await submit(app, { url: app.reverse(resource), data: { name: "" }, cookies });
    expect(empty.statusCode).toBe(422);
    const taken = await submit(app, {
      url: app.reverse(resource),
      data: testData[resource].existing,
      cookies,
    });
    expect(taken.statusCode).toBe(422);
    expect(await model.list()).toHaveLength(1);
  });

  test("update", async () => {
    const response = await submit(app, {
      method: "PATCH",
      url: app.reverse(single, { id: existing.id }),
      data: testData[resource].new,
      cookies,
    });
    expect(response.statusCode).toBe(302);
    expect(await model.find(existing.id)).toMatchObject(testData[resource].new);
  });

  test("delete", async () => {
    const response = await submit(app, {
      method: "DELETE",
      url: app.reverse(single, { id: existing.id }),
      cookies,
    });
    expect(response.statusCode).toBe(302);
    expect(await model.find(existing.id)).toBeUndefined();
  });
});
