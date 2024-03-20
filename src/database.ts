import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { env } from "./env.js";
import * as schema from "./schema.js";

const connectionString = `postgres://${env.PG_USER}:${env.PG_PASS}@${env.PG_HOST}:${env.PG_PORT}/${env.PG_NAME}`;

// for migrations
export const migrationClient = postgres(connectionString, { max: 1 });

// for query purposes
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema });
