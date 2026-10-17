import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { buildApp, getTestData, signIn, submit } from "./helpers/index.js";

describe("users", () => {
  let app;
  let testData;
  let existing;
  let cookies;

  beforeEach(async () => {
    app = await buildApp();
    testData = await getTestData();
    existing = await app.models.users.create(testData.users.existing);
    cookies = await signIn(app, testData.users.existing);
  });

  afterEach(async () => {
    await app.close();
  });

  test("index is public", async () => {
    const response = await app.inject({ url: app.reverse("users") });
    expect(response.statusCode).toBe(200);
    expect(response.body).toContain(testData.users.existing.email);
  });

  test("new", async () => {
    const response = await app.inject({ url: app.reverse("newUser") });
    expect(response.statusCode).toBe(200);
  });

  test("create", async () => {
    const response = await submit(app, { url: app.reverse("users"), data: testData.users.new });
    expect(response.statusCode).toBe(302);
    const user = await app.models.users.findByEmail(testData.users.new.email);
    expect(user).toMatchObject({ firstName: testData.users.new.firstName });
    expect(user.passwordDigest).not.toBe(testData.users.new.password);
  });

  test("create with invalid data", async () => {
    const response = await submit(app, { url: app.reverse("users"), data: testData.users.invalid });
    expect(response.statusCode).toBe(422);
    expect(await app.models.users.list()).toHaveLength(1);
  });

  test("create with taken email", async () => {
    const response = await submit(app, {
      url: app.reverse("users"),
      data: testData.users.existing,
    });
    expect(response.statusCode).toBe(422);
  });

  test("edit and update self", async () => {
    const edit = await app.inject({ url: app.reverse("editUser", { id: existing.id }), cookies });
    expect(edit.statusCode).toBe(200);

    const response = await submit(app, {
      method: "PATCH",
      url: app.reverse("user", { id: existing.id }),
      data: testData.users.new,
      cookies,
    });
    expect(response.statusCode).toBe(302);
    const updated = await app.models.users.find(existing.id);
    expect(updated).toMatchObject({ email: testData.users.new.email });
  });

  test("guest cannot edit", async () => {
    const response = await app.inject({ url: app.reverse("editUser", { id: existing.id }) });
    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe(app.reverse("root"));
  });

  test("cannot update or delete another user", async () => {
    const other = await app.models.users.create(testData.users.other);
    const update = await submit(app, {
      method: "PATCH",
      url: app.reverse("user", { id: other.id }),
      data: testData.users.new,
      cookies,
    });
    expect(update.headers.location).toBe(app.reverse("users"));

    const remove = await submit(app, {
      method: "DELETE",
      url: app.reverse("user", { id: other.id }),
      cookies,
    });
    expect(remove.statusCode).toBe(302);
    expect(await app.models.users.find(other.id)).toMatchObject({
      email: testData.users.other.email,
    });
  });

  test("delete self", async () => {
    const response = await submit(app, {
      method: "DELETE",
      url: app.reverse("user", { id: existing.id }),
      cookies,
    });
    expect(response.statusCode).toBe(302);
    expect(await app.models.users.find(existing.id)).toBeUndefined();
  });
});
