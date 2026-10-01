/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import { count, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { enqueueThreadGeneration } from '../agent.js';
import { checkCredentials, createSessionValue, requireAdmin, SESSION_COOKIE, sessionCookieOptions } from '../auth.js';
import { db } from '../db.js';
import { threads, topics } from '../schema.js';
import { idParamsSchema, latestThreads } from './threads.js';

const loginBodySchema = {
  type: 'object',
  required: ['username', 'password'],
  properties: {
    username: { type: 'string' },
    password: { type: 'string' },
  },
};

const topicBodySchema = {
  type: 'object',
  required: ['name'],
  properties: { name: { type: 'string', minLength: 1, maxLength: 100 } },
};

export async function adminRoutes(app: FastifyInstance) {
  app.post<{ Body: { username: string; password: string } }>(
    '/login',
    { schema: { body: loginBodySchema } },
    async (request, reply) => {
      if (!checkCredentials(request.body.username, request.body.password)) {
        return reply.code(401).send({ message: 'Invalid username or password' });
      }
      return reply.setCookie(SESSION_COOKIE, createSessionValue(), sessionCookieOptions).code(204).send();
    },
  );

  app.post('/logout', async (_request, reply) => {
    return reply.clearCookie(SESSION_COOKIE, { path: sessionCookieOptions.path }).code(204).send();
  });

  app.register(async (admin) => {
    admin.addHook('onRequest', requireAdmin);

    admin.get('/topics', async () => {
      return db
        .select({
          id: topics.id,
          name: topics.name,
          status: topics.status,
          generationError: topics.generationError,
          createdAt: topics.createdAt,
          threadCount: count(threads.id),
        })
        .from(topics)
        .leftJoin(threads, eq(threads.topicId, topics.id))
        .groupBy(topics.id)
        .orderBy(topics.name)
        .all();
    });

    admin.post<{ Body: { name: string } }>(
      '/topics',
      { schema: { body: topicBodySchema } },
      async (request, reply) => {
        const name = request.body.name.trim();
        if (!name) {
          return reply.code(400).send({ message: 'Topic name is required' });
        }

        const topic = db.insert(topics).values({ name }).onConflictDoNothing().returning().get();
        if (!topic) {
          return reply.code(409).send({ message: 'Topic already exists' });
        }

        // Runs in the background; the admin panel polls the topic status
        enqueueThreadGeneration(topic, admin.log);
        return reply.code(201).send(topic);
      },
    );

    admin.get('/threads', async () => latestThreads(200));

    admin.delete<{ Params: { id: number } }>(
      '/threads/:id',
      { schema: { params: idParamsSchema } },
      async (request, reply) => {
        const result = db.delete(threads).where(eq(threads.id, request.params.id)).run();
        if (result.changes === 0) {
          return reply.code(404).send({ message: 'Thread not found' });
        }
        return reply.code(204).send();
      },
    );
  });
}
