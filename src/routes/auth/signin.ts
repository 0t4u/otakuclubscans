import { eq } from "drizzle-orm";
import { t } from "elysia";

import { lucia } from "~/auth.js";
import { db } from "~/database.js";
import type { ElysiaApp } from "~/index.js";
import { BadInputError, users } from "~/schema.js";

export default (app: ElysiaApp) => app.post("/", async ({ body, set }) => {
    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, body.email),
        });

        if (!user) {
            set.status = "Bad Request";
            return {
                error: true,
                data: {
                    message: "Invalid email or password",
                }
            };
        }

        const validPassword = await Bun.password.verify(body.password, user.password);
        if (!validPassword) {
            return {
                error: true,
                data: {
                    message: "Invalid email or password",
                }
            };
        }

        const session = await lucia.createSession(user.id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        set.status = "Temporary Redirect";
        set.headers = {
            Location: "/",
            "Set-Cookie": sessionCookie.serialize(),
        };
    } catch (ex) {
        const error = ex as Error | BadInputError;
        if (error instanceof BadInputError) {
            // i dunno how to have good error messages
            // tbh this should never ever get called
            // if it does we kinda fucked
            // but just bubble it up anyways
            throw error;
        }
        throw error;
    }
}, {
    body: t.Object({
        username: t.String({ minLength: 3 }),
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
    }),
});
