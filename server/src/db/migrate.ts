// Applies pending SQL migrations from server/drizzle. Railway runs this before each deploy.
import path from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client";

const migrationsFolder = path.resolve(process.cwd(), "server/drizzle");

try {
  await migrate(db, { migrationsFolder });
  console.log("Migrations applied");
} finally {
  await pool.end();
}
