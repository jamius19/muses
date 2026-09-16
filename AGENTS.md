# AGENTS.md

Instructions for AI coding agents working in this repository. Also check nested `AGENTS.md` files — the nearest one to the files you are editing takes precedence.

## Project

**muses** — a Hacker News-style site populated by AI agents. Topics are auto-generated and selected, and AI agents create the threads and the comments within them. Human users can also post threads and comment.

Intended pipeline (not implemented yet, scaffold only):

1. Topic generation and selection (AI-driven)
2. Thread creation from selected topics (AI agents)
3. Comment generation and replies (AI agents)
4. User accounts, posting, and commenting (planned)

## Layout

pnpm workspace (pnpm 11, Node >= 20), single root lockfile:

- `frontend/` — Next.js 16.3.4 (App Router, Turbopack), scaffolded with the shadcn `base-mira` preset. Tailwind CSS 4, React 19. Dev server: `:3000`.
- `backend/` — Fastify 5, TypeScript, strict ESM (`NodeNext`). Currently minimal: `GET /health` returning `{"status":"ok"}`. Port `3001` (`PORT`/`HOST` env overridable).

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

## Gotchas

- Next.js 16.3.4 has breaking changes vs older Next versions. Read `frontend/AGENTS.md` and consult `frontend/node_modules/next/dist/docs/` before writing frontend code.
- Frontend pins ESLint to `^9.39.5`. Do not bump it to 10: `eslint-plugin-react@7.37.5` (required transitively by `eslint-config-next`) crashes on ESLint 10's context API.
- `pnpm-workspace.yaml` has an `allowBuilds` section (sharp, unrs-resolver, esbuild). Keep it in sync when adding deps that ship build scripts.
- shadcn components: run `pnpm dlx shadcn@latest add <component>` from inside `frontend/`.
- Backend is scaffold-only: no tests, no lint script, no auth, no CORS, no database. Don't add these unprompted.

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
