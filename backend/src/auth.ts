/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import { createHash, timingSafeEqual } from 'node:crypto';
import type { CookieSerializeOptions } from '@fastify/cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { env } from './env.js';

export const SESSION_COOKIE = 'admin_session';

const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

export const sessionCookieOptions: CookieSerializeOptions = {
  path: '/admin',
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  signed: true,
  maxAge: SESSION_TTL_SECONDS,
};

function sha256(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

export function checkCredentials(username: string, password: string): boolean {
  // Evaluate both so the response time doesn't reveal which one was wrong
  const usernameOk = safeEqual(username, env.adminUsername);
  const passwordOk = safeEqual(password, env.adminPassword);
  return usernameOk && passwordOk;
}

// Cookie value is the expiry timestamp; @fastify/cookie signs it with ADMIN_SESSION_SECRET
export function createSessionValue(): string {
  return String(Date.now() + SESSION_TTL_SECONDS * 1000);
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  const raw = request.cookies[SESSION_COOKIE];
  const session = raw ? request.unsignCookie(raw) : null;

  if (!session?.valid || Number(session.value) < Date.now()) {
    return reply.code(401).send({ message: 'Unauthorized' });
  }
}
