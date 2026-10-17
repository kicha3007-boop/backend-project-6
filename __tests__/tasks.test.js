import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { buildApp, getTestData, signIn, submit } from "./helpers/index.js";

describe("tasks", () => {
  let app;
  let testData;
  let cookies;
  let author;
  let status;
  let label;

  const createTask = (overrides = {}) =>
    app.models.tasks.create(
      {
        ...testData.tasks.new,
        statusId: status.id,
        executorId: author.id,
        labels: [label.id],
        ...overrides,
      },
      author.id,
    );

  beforeEach(async () => {
    app = await buildApp();
    testData = await getTestData();
    author = await app.models.users.create(testData.users.existing);
    cookies = await signIn(app, testData.users.existing);
    status = await app.models.statuses.create(testData.statuses.existing);
    label = await app.models.labels.create(testData.labels.existing);
  });

  afterEach(async () => {
    await app.close();
  });

  test("index, show and forms", async () => {
    const task = await createTask();
    const index = await app.inject({ url: app.reverse("tasks"), cookies });
    expect(index.statusCode).toBe(200);
    expect(index.body).toContain(testData.tasks.new.name);

    const show = await app.inject({ url: app.reverse("task", { id: task.id }), cookies });
    expect(show.statusCode).toBe(200);
    expect(show.body).toContain(testData.labels.existing.name);

    expect((await app.inject({ url: app.reverse("newTask"), cookies })).statusCode).toBe(200);
    expect(
      (await app.inject({ url: app.reverse("editTask", { id: task.id }), cookies })).statusCode,
    ).toBe(200);
  });

  test("create with labels", async () => {
    const response = await submit(app, {
      url: app.reverse("tasks"),
      data: { ...testData.tasks.new, statusId: status.id, executorId: author.id, labels: label.id },
      cookies,
    });
    expect(response.statusCode).toBe(302);
    const [task] = await app.models.tasks.list();
    expect(task).toMatchObject({ name: testData.tasks.new.name, creatorId: author.id });
    expect(task.labels.map(({ name }) => name)).toEqual([testData.labels.existing.name]);
  });

  test("create with empty form", async () => {
    const response = await submit(app, { url: app.reverse("tasks"), data: { name: "" }, cookies });
    expect(response.statusCode).toBe(422);
    expect(await app.models.tasks.list()).toHaveLength(0);
  });

  test("update", async () => {
    const task = await createTask();
    const response = await submit(app, {
      method: "PATCH",
      url: app.reverse("task", { id: task.id }),
      data: { name: "Обновлённая", statusId: status.id },
      cookies,
    });
    expect(response.statusCode).toBe(302);
    const updated = await app.models.tasks.find(task.id);
    expect(updated).toMatchObject({ name: "Обновлённая", executorId: null });
    expect(updated.labels).toEqual([]);
  });

  test("only author deletes", async () => {
    const task = await createTask();
    await app.models.users.create(testData.users.other);
    const otherCookies = await signIn(app, testData.users.other);

    await submit(app, {
      method: "DELETE",
      url: app.reverse("task", { id: task.id }),
      cookies: otherCookies,
    });
    expect(await app.models.tasks.find(task.id)).toBeTruthy();

    await submit(app, { method: "DELETE", url: app.reverse("task", { id: task.id }), cookies });
    expect(await app.models.tasks.find(task.id)).toBeUndefined();
  });

  test("linked status, label and user are kept", async () => {
    await createTask();
    await submit(app, { method: "DELETE", url: app.reverse("status", { id: status.id }), cookies });
    await submit(app, { method: "DELETE", url: app.reverse("label", { id: label.id }), cookies });
    await submit(app, { method: "DELETE", url: app.reverse("user", { id: author.id }), cookies });

    expect(await app.models.statuses.find(status.id)).toBeTruthy();
    expect(await app.models.labels.find(label.id)).toBeTruthy();
    expect(await app.models.users.find(author.id)).toBeTruthy();
  });

  test("filter", async () => {
    const other = await app.models.users.create(testData.users.other);
    const otherStatus = await app.models.statuses.create(testData.statuses.new);
    await createTask({ name: "labelled" });
    await createTask({ name: "plain", statusId: otherStatus.id, executorId: null, labels: [] });
    await app.models.tasks.create({ name: "foreign", statusId: otherStatus.id }, other.id);

    const names = async (filter) =>
      (await app.models.tasks.list(filter, author.id)).map(({ name }) => name).sort();

    expect(await names({ status: String(status.id) })).toEqual(["labelled"]);
    expect(await names({ label: String(label.id) })).toEqual(["labelled"]);
    expect(await names({ executor: String(author.id) })).toEqual(["labelled"]);
    expect(await names({ isCreatorUser: "on" })).toEqual(["labelled", "plain"]);

    const page = await app.inject({ url: `${app.reverse("tasks")}?status=${status.id}`, cookies });
    expect(page.body).toContain("labelled");
    expect(page.body).not.toContain("plain");
  });
});
