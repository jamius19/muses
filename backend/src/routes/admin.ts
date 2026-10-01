/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import { count, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { generateThreads } from '../agent.js';
import { checkCredentials, createSessionValue, requireAdmin, SESSION_COOKIE, sessionCookieOptions } from '../auth.js';
import { db } from '../db.js';
import { threads, topics } from '../schema.js';
import { latestThreads } from './threads.js';

const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'integer' } },
};

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
        return reply.code(201).send(topic);
      },
    );

    admin.post<{ Params: { id: number } }>(
      '/topics/:id/generate',
      { schema: { params: idParamsSchema } },
      async (request, reply) => {
        const topic = db.select().from(topics).where(eq(topics.id, request.params.id)).get();
        if (!topic) {
          return reply.code(404).send({ message: 'Topic not found' });
        }

        try {
          const created = await generateThreads(topic);
          request.log.info({ topic: topic.name, created: created.length }, 'thread agent finished');
          return { threads: created };
        } catch (error) {
          // Upstream errors carry their own status (e.g. OpenRouter 401), which must not look like an admin 401
          request.log.error(error, 'thread agent failed');
          const message = error instanceof Error ? error.message : 'Unknown error';
          return reply.code(502).send({ message: `Thread agent failed: ${message}` });
        }
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
