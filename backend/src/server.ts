/*
 * Author: Jamius Siam
 * Since: 09/02/2026
 */
import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { env } from './env.js';
import { adminRoutes } from './routes/admin.js';
import { threadRoutes } from './routes/threads.js';

const server = Fastify({
  logger: true,
});

server.register(cookie, { secret: env.adminSessionSecret });
server.register(cors, { origin: env.corsOrigin, credentials: true, methods: ['GET', 'POST', 'DELETE'] });
server.register(threadRoutes);
server.register(adminRoutes, { prefix: '/admin' });

server.get('/health', async () => {
  return { status: 'ok' };
});

const port = Number(process.env.PORT) || 3001;
const host = process.env.HOST || '127.0.0.1';

server.listen({ port, host }, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
  server.log.info(`Server listening at ${address}`);
});
