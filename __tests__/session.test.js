import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { buildApp, getTestData, submit } from "./helpers/index.js";

describe("session", () => {
  let app;
  let testData;

  beforeEach(async () => {
    app = await buildApp();
    testData = await getTestData();
    await app.models.users.create(testData.users.existing);
  });

  afterEach(async () => {
    await app.close();
  });

  test("root and sign in form", async () => {
    expect((await app.inject({ url: app.reverse("root") })).statusCode).toBe(200);
    expect((await app.inject({ url: app.reverse("newSession") })).statusCode).toBe(200);
  });

  test("sign in and sign out", async () => {
    const signIn = await submit(app, {
      url: app.reverse("session"),
      data: testData.users.existing,
    });
    expect(signIn.statusCode).toBe(302);
    const [sessionCookie] = signIn.cookies;
    const cookies = { [sessionCookie.name]: sessionCookie.value };

    expect((await app.inject({ url: app.reverse("tasks"), cookies })).statusCode).toBe(200);

    const signOut = await submit(app, { method: "DELETE", url: app.reverse("session"), cookies });
    expect(signOut.statusCode).toBe(302);
  });

  test("wrong password", async () => {
    const response = await submit(app, {
      url: app.reverse("session"),
      data: { email: testData.users.existing.email, password: "wrong" },
    });
    expect(response.statusCode).toBe(422);
  });
});
