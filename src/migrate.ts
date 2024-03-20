import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { migrationClient } from "./database.js";

// This will run migrations on the database, skipping the ones already applied
await migrate(drizzle(migrationClient), { migrationsFolder: "./drizzle" });

// Don't forget to close the connection, otherwise the script will hang
await migrationClient.end();
