import { boolean, integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	sub: text('sub').notNull().unique(),
	email: text('email').notNull().default(''),
	firstName: text('first_name'),
	username: text('username'),
	avatar: text('avatar'),
	slackId: text('slack_id'),
	verificationStatus: text('verification_status'),
	yswsEligible: boolean('ysws_eligible'),
	role: text('role').notNull().default('member'),
	hackatimeUserId: integer('hackatime_user_id'),
	hackatimeToken: text('hackatime_token'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	token: text('token').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow()
});

export const projects = pgTable('projects', {
	id: text('id').primaryKey(),
	userId: integer('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	title: text('title').notNull().default('untitled'),
	code: text('code').notNull(),
	mode: text('mode').notNull().default('bytebeat'),
	sampleRate: integer('sample_rate').notNull().default(8000),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
