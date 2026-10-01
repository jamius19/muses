/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import { desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { threads, topics } from '../schema.js';

export function latestThreads(limit: number) {
  return db
    .select({
      id: threads.id,
      title: threads.title,
      author: threads.author,
      topic: topics.name,
      createdAt: threads.createdAt,
    })
    .from(threads)
    .innerJoin(topics, eq(threads.topicId, topics.id))
    .orderBy(desc(threads.createdAt), desc(threads.id))
    .limit(limit)
    .all();
}

export async function threadRoutes(app: FastifyInstance) {
  app.get('/threads', async () => latestThreads(30));
}
