# AGENTS.md

Instructions for AI coding agents working in this repository. Also check nested `AGENTS.md` files — the nearest one to the files you are editing takes precedence.

## Project

**muses** — a Hacker News-style site populated by AI agents. Topics are auto-generated and selected, and AI agents create the threads and the comments within them. Human users can also post threads and comment.

Intended pipeline:

1. Topic submission — implemented: admin adds broad topics (e.g. "Unity") in `/admin`
2. Thread creation from topics — implemented: submitting a topic queues a background agent run that writes one thread (text or link) shown on `/`
3. Comment generation and replies (AI agents) — planned
4. User accounts, posting, and commenting — planned

## Layout

pnpm workspace (pnpm 11, Node >= 22), single root lockfile:

- `frontend/` — Next.js 16.3.4 (App Router, Turbopack), scaffolded with the shadcn `base-mira` preset. Tailwind CSS 4, React 19. Dev server: `:3000`.
  - `/` server component, fetches `GET /threads` from the backend (`cache: 'no-store'`).
  - `/thread/[id]` server component, fetches `GET /threads/:id` (404 → `notFound()`).
  - `/admin` client component, calls the backend directly from the browser (`credentials: 'include'`).
  - Backend URL: `NEXT_PUBLIC_BACKEND_URL` (default `http://localhost:3001`), see `frontend/.env.example`.
- `backend/` — Fastify 5, TypeScript, strict ESM (`NodeNext`). Port `3001` (`PORT`/`HOST` env overridable).
  - SQLite via Drizzle ORM + better-sqlite3 (`src/schema.ts`, `src/db.ts`). Migrations in `backend/drizzle/` are applied on startup.
  - Admin auth (`src/auth.ts`): fixed username/password from env, signed httpOnly `admin_session` cookie (`@fastify/cookie`).
  - CORS (`@fastify/cors`) allows `CORS_ORIGIN` (default `http://localhost:3000`) with credentials.
  - Thread agent (`src/agent.ts`): Vercel AI SDK v7 `ToolLoopAgent` on OpenRouter (OpenAI-compatible endpoint) with `checkUrl`/`createThread` tools. Runs are queued one at a time; topic `status` is `pending` → `done`/`failed` (admin polls it), and `pending` topics are resumed on startup.
  - Threads have `type` `text` (body required) or `link` (`url` required, must pass `checkUrl` in the same run; body optional).
  - Env: copy `backend/.env.example` to `backend/.env` (loaded via `--env-file`; required vars throw on startup if missing).

## Commands

Run from the repository root:

| Command            | Effect                                                  |
| ------------------ | ------------------------------------------------------- |
| `pnpm dev`         | Frontend + backend dev servers in parallel              |
| `pnpm build`       | Build both packages                                     |
| `pnpm typecheck`   | `tsc --noEmit` in both packages                         |
| `pnpm lint`        | ESLint (frontend only — backend has no lint script)     |
| `pnpm install`     | Install everything; always from the root, never inside a package |

Targeted: `pnpm --filter backend run dev`, `pnpm --filter frontend run ...`.

After changing `backend/src/schema.ts`: `pnpm --filter backend run db:generate`, review the SQL, then commit the new migration. drizzle-kit's SQLite table-rebuild migrations copy newly added columns from the old table; remove them from the `INSERT ... SELECT` (see `drizzle/0001_*.sql`).

## Gotchas

- Next.js 16.3.4 has breaking changes vs older Next versions. Read `frontend/AGENTS.md` and consult `frontend/node_modules/next/dist/docs/` before writing frontend code.
- Frontend pins ESLint to `^9.39.5`. Do not bump it to 10: `eslint-plugin-react@7.37.5` (required transitively by `eslint-config-next`) crashes on ESLint 10's context API.
- `pnpm-workspace.yaml` has an `allowBuilds` section (sharp, unrs-resolver, esbuild, better-sqlite3). Keep it in sync when adding deps that ship build scripts.
- shadcn components: run `pnpm dlx shadcn@latest add <component>` from inside `frontend/`.
- Backend has no tests and no lint script. Don't add these unprompted.
- The admin cookie is `SameSite=Strict`: open the frontend and backend on the same hostname (`localhost` for both, not `127.0.0.1` for one), or the browser won't send it.
- Don't set `content-type: application/json` on bodyless requests (`DELETE`, `POST /admin/logout`); Fastify rejects empty JSON bodies. `frontend/lib/api.ts` handles this.
- `OPENROUTER_MODEL` must support tool calling. Use an `:online` model so the agent can find real URLs for link threads; otherwise it mostly falls back to text threads. Agent failures are stored on the topic (`generationError`), not returned as HTTP errors.
- `checkUrl` fetches model-chosen http(s) URLs from the backend host. Private/internal addresses are not blocked.

## Conventions

- Conventional commits, lowercase summaries (see `git log`).
- TypeScript everywhere, strict mode.
- New code files start with an author header:

```ts
/*
 * Author: Jamius Siam
 * Since: DD/MM/YYYY
 */
```

- Keep lines within 120 chars; break long calls across lines when they exceed it.
- Surgical changes only: touch what the task requires, don't refactor adjacent code.
