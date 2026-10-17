import { Strategy } from "@fastify/passport";

// Вход по форме: email и пароль из data[email], data[password]
export default class FormStrategy extends Strategy {
  constructor(name, app) {
    super(name);
    this.app = app;
  }

  async authenticate(request) {
    if (request.isAuthenticated()) {
      return this.pass();
    }

    const { email, password } = request.body?.data ?? {};
    const { users } = this.app.models;
    const user = await users.findByEmail(email);
    if (user && (await users.verifyPassword(user, password))) {
      return this.success(user);
    }

    return this.fail();
  }
}
