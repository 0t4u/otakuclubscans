import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { Lucia } from "lucia";

import { db } from "./database";
import { NodeEnv, env } from "./env";
import { sessions, users, type User } from "./schema";

const adapter = new DrizzlePostgreSQLAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
    sessionCookie: {
        attributes: {
            secure: env.NODE_ENV === NodeEnv.PRODUCTION,
        },
    },
    getUserAttributes: (attributes) => {
        return {
            id: attributes.id,
            username: attributes.username,
            email: attributes.email,
            createdAt: attributes.createdAt,
        };
    }
});

declare module "lucia" {
    interface Register {
        Lucia: typeof lucia,
        DatabaseUserAttributes: Omit<User, "password" | "updatedAt">
    }
}
