import { html } from "@elysiajs/html";
import { serverTiming } from "@elysiajs/server-timing";
import { Elysia } from "elysia";
import { autoload } from "elysia-autoload";
import { htmx } from "elysia-htmx";
import { verifyRequestOrigin, type Session, type User } from "lucia";

import { lucia } from "./auth.js";
import { env } from "./env.js";
import { Logger } from "./logger.js";

const logger = new Logger("Request");

export const server = new Elysia()
    .derive(
        async (
            context
        ): Promise<{
            user: User | null;
            session: Session | null;
        }> => {
            // CSRF check
            if (context.request.method !== "GET") {
                const originHeader = context.request.headers.get("Origin");
                // NOTE: You may need to use `X-Forwarded-Host` instead
                const hostHeader = context.request.headers.get("Host");
                if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
                    return {
                        user: null,
                        session: null
                    };
                }
            }

            // use headers instead of Cookie API to prevent type coercion
            const cookieHeader = context.request.headers.get("Cookie") ?? "";
            const sessionId = lucia.readSessionCookie(cookieHeader);
            if (!sessionId) {
                return {
                    user: null,
                    session: null
                };
            }

            const { session, user } = await lucia.validateSession(sessionId);
            if (session && session.fresh) {
                const sessionCookie = lucia.createSessionCookie(session.id);
                context.cookie[sessionCookie.name].set({
                    value: sessionCookie.value,
                    ...sessionCookie.attributes
                });
            }
            if (!session) {
                const sessionCookie = lucia.createBlankSessionCookie();
                context.cookie[sessionCookie.name].set({
                    value: sessionCookie.value,
                    ...sessionCookie.attributes
                });
            }
            return {
                user,
                session
            };
        }
    )
    .use(html())
    .use(htmx())
    .use(autoload())
    .use(serverTiming({ allow: true }))
    .onRequest(({ request }) => {
        logger.debug(`${request.method} ${request.url}`);
    })
    .mapResponse(({ response }) => {
        const isJson = typeof response === "object";

        const text = isJson
            ? JSON.stringify(response)
            : response?.toString() ?? "";

        return new Response(
            text,
            {
                headers: {
                    "Content-Type": `${
                        isJson ? "application/json" : "text/plain"
                    }; charset=utf-8`
                }
            }
        );
    })
    .onError(({ code, error, set }) => {
        switch (code) {
            case "NOT_FOUND":
                set.status = "Not Found";
                break;
            case "VALIDATION":
            case "INVALID_COOKIE_SIGNATURE":
                set.status = "Bad Request";
            break;
            case "PARSE":
            case "UNKNOWN":
            case "INTERNAL_SERVER_ERROR":
                set.status = "Internal Server Error";
                break;
        }

        return {
            error: true,
            data: {
                message: error.message,
            },
        };
    })
    .onStart(() => {
        logger.info(`Started at http://${env.OKS_HOST}:${env.OKS_PORT}`);
    })
    .listen(env.OKS_PORT);

export type ElysiaApp = typeof server;
