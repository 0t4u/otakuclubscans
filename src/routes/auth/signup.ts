import { t } from "elysia";

import { lucia } from "~/auth.js";
import type { ElysiaApp } from "~/index.js";
import { BadInputError, insertUser, type User } from "~/schema.js";

export default (app: ElysiaApp) => app.post("/", async ({ body, set }) => {
    const hashedPassword = await Bun.password.hash(body.password, "argon2id");

    try {
        const user = await insertUser({
            username: body.username,
            email: body.email,
            password: hashedPassword,
        });

        const session = await lucia.createSession((user as unknown as User).id, {});
        const sessionCookie = lucia.createSessionCookie(session.id);

        set.status = "Temporary Redirect";
        set.headers = {
            Location: "/",
            "Set-Cookie": sessionCookie.serialize(),
        };

        return;
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
