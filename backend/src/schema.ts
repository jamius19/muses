/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const topics = sqliteTable('topics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  // Thread generation runs in the background after the topic is submitted
  status: text('status', { enum: ['pending', 'done', 'failed'] })
    .notNull()
    .default('pending'),
  generationError: text('generation_error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

export type Topic = typeof topics.$inferSelect;

export const threads = sqliteTable('threads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  topicId: integer('topic_id')
    .notNull()
    .references(() => topics.id),
  type: text('type', { enum: ['text', 'link'] })
    .notNull()
    .default('text'),
  title: text('title').notNull(),
  // Required for text threads, optional for link threads
  body: text('body'),
  url: text('url'),
  author: text('author').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});
