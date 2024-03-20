import { Type as t, type Static } from "@sinclair/typebox";
import Ajv from "ajv";
import addFormats from "ajv-formats";

import { Logger } from "./logger.js";

const logger = new Logger("EnvParser");

const withDevDefault = <T>(val: T) => (process.env.NODE_ENV !== "production") ? val : undefined;

export enum NodeEnv {
    DEVELOPMENT = "development",
    TEST = "test",
    PRODUCTION = "production",
}

const ajv = addFormats(new Ajv({}), [
    "date-time",
    "time",
    "date",
    "email",
    "hostname",
    "ipv4",
    "ipv6",
    "uri",
    "uri-reference",
    "uuid",
    "uri-template",
    "json-pointer",
    "relative-json-pointer",
    "regex"
]);

const Schema = t.Object({
    NODE_ENV: t.Enum(NodeEnv, { default: NodeEnv.DEVELOPMENT }),
    OKS_HOST: t.String({ format: "hostname", default: "0.0.0.0" }),
    // i dont know why the fuck this doesnt work
    // JSB_PORT: t.RegExp(/[0-65535]/, { default: withDevDefault("3000") }),
    OKS_PORT: t.String({ default: withDevDefault("3000") }),
    OKS_FINGERPRINT: t.Optional(t.String()),
    PG_HOST: t.String({ format: "hostname", default: withDevDefault("0.0.0.0") }),
    PG_PORT: t.String({ default: withDevDefault("5432") }),
    PG_USER: t.String({ default: withDevDefault("postgres") }),
    PG_PASS: t.String({ default: withDevDefault("postgres") }),
    PG_NAME: t.String({ default: withDevDefault("oksdev") }),
});

type Schema = Static<typeof Schema>;

function getEnv(): Schema {
    try {
        ajv.compile(Schema)(Bun.env);

        return Bun.env as Schema;
    } catch (err) {
        logger.error(err);

        process.exit(1);
    }
}

export const env = getEnv();
