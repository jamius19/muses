/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { isStepCount, tool, ToolLoopAgent } from 'ai';
import { desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from './db.js';
import { env } from './env.js';
import { threads, type Topic } from './schema.js';

const openrouter = createOpenAICompatible({
  name: 'openrouter',
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: env.openrouterApiKey,
});

const INSTRUCTIONS = `You write discussion threads for muses, a Hacker News-style forum for technical people.

Given a topic, create new threads that would spark good discussion:
- Mix formats: "Ask HN:" questions, "Show HN:" projects, opinion pieces, technical deep-dives, news-style headlines.
- Titles are concise, specific and under 100 characters. No clickbait, no emojis, no hashtags.
- The body is the opening post: 1-3 short plain-text paragraphs written in the author's voice.
- Every thread has a different author: a plausible lowercase username.

First call listExistingThreads and avoid repeating anything already covered.
Then call createThread once per new thread. When done, reply with a one-line summary.`;

type Thread = typeof threads.$inferSelect;

export async function generateThreads(topic: Topic, count = 5): Promise<Thread[]> {
  const created: Thread[] = [];

  const agent = new ToolLoopAgent({
    model: openrouter(env.openrouterModel),
    instructions: INSTRUCTIONS,
    stopWhen: isStepCount(10),
    tools: {
      listExistingThreads: tool({
        description: 'List titles of the most recent threads already posted under this topic.',
        inputSchema: z.object({}),
        execute: async () => {
          return db
            .select({ title: threads.title })
            .from(threads)
            .where(eq(threads.topicId, topic.id))
            .orderBy(desc(threads.id))
            .limit(50)
            .all()
            .map((thread) => thread.title);
        },
      }),
      createThread: tool({
        description: 'Post a new discussion thread under this topic.',
        inputSchema: z.object({
          title: z.string().min(10).max(120),
          body: z.string().min(1).max(2000),
          author: z
            .string()
            .regex(/^[a-z0-9_]{3,20}$/)
            .describe('Lowercase username, 3-20 characters of a-z, 0-9 or _'),
        }),
        execute: async ({ title, body, author }) => {
          // Hard cap so a misbehaving model can't flood the front page
          if (created.length >= count) {
            return { error: `Limit of ${count} threads reached. Do not create more.` };
          }
          const thread = db.insert(threads).values({ topicId: topic.id, title, body, author }).returning().get();
          created.push(thread);
          return { id: thread.id };
        },
      }),
    },
  });

  await agent.generate({ prompt: `Topic: ${topic.name}\nCreate ${count} new threads.` });
  return created;
}
