import { labels, statuses } from "../db/schema.js";
import createDictionary from "./dictionary.js";
import createTasks from "./tasks.js";
import createUsers from "./users.js";

export default (db) => {
  const tasks = createTasks(db);
  return {
    users: createUsers(db),
    statuses: createDictionary(db, statuses, tasks.hasStatus),
    labels: createDictionary(db, labels, tasks.hasLabel),
    tasks,
  };
};
