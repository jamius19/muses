/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { isStepCount, tool, ToolLoopAgent } from 'ai';
import { eq } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import { z } from 'zod';
import { db } from './db.js';
import { env } from './env.js';
import { threads, topics, type Topic } from './schema.js';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: env.openrouterApiKey,
});

const INSTRUCTIONS = `You write discussion threads for muses, a Hacker News-style forum for technical people.

Given a topic, create exactly one new thread that would spark good discussion. Pick one type:
- link: shares a real, specific web page about the topic (article, blog post, docs, repository, release notes).
  Call checkUrl first and only post a URL it reports as ok. The title reads like the page's headline.
  The body is optional: a short note from the submitter.
- text: an "Ask HN:" question, opinion piece or discussion starter. The body is required:
  1-3 short plain-text paragraphs written in the author's voice.
If none of the URLs you check are ok, post a text thread instead.

Titles are concise, specific and under 100 characters. No clickbait, no emojis, no hashtags.
The author is a plausible lowercase username.
Call createThread once, then reply with a one-line summary.`;

const httpUrl = z.url({ protocol: /^https?$/ });

type Thread = typeof threads.$inferSelect;

async function generateThread(topic: Topic): Promise<Thread> {
  const verifiedUrls = new Set<string>();
  let created: Thread | undefined;

  const agent = new ToolLoopAgent({
    model: openrouter(env.openrouterModel),
    instructions: INSTRUCTIONS,
    stopWhen: isStepCount(8),
    tools: {
      checkUrl: tool({
        description: 'Check that a URL loads (HTTP GET, follows redirects). Required before posting a link thread.',
        inputSchema: z.object({ url: httpUrl }),
        execute: async ({ url }) => {
          try {
            const response = await fetch(url, {
              headers: { 'user-agent': 'Mozilla/5.0 (compatible; muses-bot/0.1)' },
              signal: AbortSignal.timeout(10_000),
            });
            await response.body?.cancel();
            if (response.ok) {
              verifiedUrls.add(url);
            }
            return { ok: response.ok, status: response.status };
          } catch (error) {
            return { ok: false, error: error instanceof Error ? error.message : String(error) };
          }
        },
      }),
      createThread: tool({
        description: 'Post the new discussion thread under this topic.',
        inputSchema: z.object({
          type: z.enum(['text', 'link']),
          title: z.string().min(10).max(120),
          url: httpUrl.optional().describe('Required for link threads, must have passed checkUrl'),
          body: z.string().max(2000).optional().describe('Required for text threads, optional for link threads'),
          author: z
            .string()
            .regex(/^[a-z0-9_]{3,20}$/)
            .describe('Lowercase username, 3-20 characters of a-z, 0-9 or _'),
        }),
        execute: async ({ type, title, url, body, author }) => {
          if (created) {
            return { error: 'A thread was already created. Do not create more.' };
          }
          if (type === 'link' && (!url || !verifiedUrls.has(url))) {
            return { error: 'Link threads need a url that passed checkUrl.' };
          }
          if (type === 'text' && !body) {
            return { error: 'Text threads need a body.' };
          }

          created = db
            .insert(threads)
            .values({
              topicId: topic.id,
              type,
              title,
              url: type === 'link' ? url : null,
              body: body || null,
              author,
            })
            .returning()
            .get();
          return { id: created.id };
        },
      }),
    },
  });

  await agent.generate({ prompt: `Topic: ${topic.name}` });

  if (!created) {
    throw new Error('Agent finished without creating a thread');
  }
  return created;
}

async function runGeneration(topic: Topic, log: FastifyBaseLogger) {
  try {
    const thread = await generateThread(topic);
    db.update(topics).set({ status: 'done', generationError: null }).where(eq(topics.id, topic.id)).run();
    log.info({ topic: topic.name, thread: thread.id, type: thread.type }, 'thread generated');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    db.update(topics).set({ status: 'failed', generationError: message }).where(eq(topics.id, topic.id)).run();
    log.error({ err: error, topic: topic.name }, 'thread generation failed');
  }
}

// One generation at a time, so a burst of new topics doesn't hit the model provider in parallel
let queue = Promise.resolve();

export function enqueueThreadGeneration(topic: Topic, log: FastifyBaseLogger) {
  queue = queue
    .then(() => runGeneration(topic, log))
    .catch((error) => log.error(error, 'thread generation queue error'));
}

// Picks up topics left pending when the server stopped mid-generation
export function resumePendingGenerations(log: FastifyBaseLogger) {
  const pending = db.select().from(topics).where(eq(topics.status, 'pending')).all();
  for (const topic of pending) {
    enqueueThreadGeneration(topic, log);
  }
}
