/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import { desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { db } from '../db.js';
import { threads, topics } from '../schema.js';

export const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'integer' } },
};

const threadColumns = {
  id: threads.id,
  type: threads.type,
  title: threads.title,
  url: threads.url,
  author: threads.author,
  topic: topics.name,
  createdAt: threads.createdAt,
};

export function latestThreads(limit: number) {
  return db
    .select(threadColumns)
    .from(threads)
    .innerJoin(topics, eq(threads.topicId, topics.id))
    .orderBy(desc(threads.createdAt), desc(threads.id))
    .limit(limit)
    .all();
}

export async function threadRoutes(app: FastifyInstance) {
  app.get('/threads', async () => latestThreads(30));

  app.get<{ Params: { id: number } }>(
    '/threads/:id',
    { schema: { params: idParamsSchema } },
    async (request, reply) => {
      const thread = db
        .select({ ...threadColumns, body: threads.body })
        .from(threads)
        .innerJoin(topics, eq(threads.topicId, topics.id))
        .where(eq(threads.id, request.params.id))
        .get();
      if (!thread) {
        return reply.code(404).send({ message: 'Thread not found' });
      }
      return thread;
    },
  );
}
