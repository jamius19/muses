/*
 * Author: Jamius Siam
 * Since: 09/02/2026
 */
import Fastify from 'fastify';

const server = Fastify({
  logger: true,
});

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
