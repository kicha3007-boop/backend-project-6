import "dotenv/config";
import createDb from "./index.js";

// make db-migrate: накатить миграции на базу из настроек и выйти
const { close } = await createDb();
await close();
console.log("Migrations applied");
