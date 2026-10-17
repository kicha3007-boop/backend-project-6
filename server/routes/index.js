import dictionary from "./dictionary.js";
import session from "./session.js";
import tasks from "./tasks.js";
import users from "./users.js";
import welcome from "./welcome.js";

export default (app) => {
  welcome(app);
  session(app);
  users(app);
  dictionary(app, { resource: "statuses", single: "status", model: app.models.statuses });
  dictionary(app, { resource: "labels", single: "label", model: app.models.labels });
  tasks(app);
};
