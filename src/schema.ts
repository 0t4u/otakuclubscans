import { init } from "@paralleldrive/cuid2";
import { Value } from "@sinclair/typebox/value";
import { relations } from "drizzle-orm";
import { pgTable, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-typebox";
import { t } from "elysia";

import { db } from "./database.js";

export class BadInputError extends Error {}

const createId = init({
    random: Math.random,
    length: 24,
    // fingerprint: env.JSB_FINGERPRINT,
});

export const users = pgTable("users", {
    id: varchar("id", { length: 32 }).primaryKey().$defaultFn(() => createId()),
    username: varchar("username", { length: 256 }).unique().notNull(),
    email: varchar("email", { length: 256 }).unique().notNull(),
    password: varchar("password", { length: 256 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export const insertUserSchema = createInsertSchema(users, {
    // @ts-expect-error what the fuck is [KIND] and why is it missing
    email: t.String({ format: "email" })
});
export const insertUser = async (user: NewUser) => {
    if (!Value.Check(insertUserSchema, user)) throw new BadInputError("Input does not match schema.");
    return db.insert(users).values(user);
};

export const selectUserSchema = createSelectSchema(users);

export const sessions = pgTable("sessions", {
    id: varchar("id", { length: 32 }).primaryKey(),
    userId: varchar("userId", { length: 32 }).notNull().references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
});

export type Session = typeof sessions.$inferSelect;

export const sessionRelations = relations(sessions, ({ one }) => ({
    userId: one(users, {
        fields: [sessions.userId],
        references: [users.id],
    }),
}));
