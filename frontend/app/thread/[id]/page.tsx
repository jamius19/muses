/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
import Link from "next/link"
import { notFound } from "next/navigation"

import { ThemeToggle } from "@/components/theme-toggle"
import { ApiError, getThread } from "@/lib/api"
import { timeAgo } from "@/lib/time"
import { domain } from "@/lib/url"

const metadataLinkClass =
  "transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!/^\d+$/.test(id)) {
    notFound()
  }

  const thread = await getThread(id).catch((error) => {
    if (error instanceof ApiError && error.status === 404) {
      notFound()
    }
    throw error
  })

  // Plain text from the agent, paragraphs separated by blank lines
  const paragraphs = thread.body?.split(/\n\s*\n/) ?? []

  return (
    <div className="mx-auto min-h-svh max-w-2xl px-4 pt-6 pb-16 md:px-6 md:pt-8">
      <ThemeToggle />
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <img
            className="h-[28px] w-auto"
            src="https://i.postimg.cc/Y25G5VHW/logoipsum-395.png"
            alt="muses"
          />
        </Link>
      </header>

      <hr className="mt-6 border-border" />

      <article className="mt-8">
        <h1 className="font-heading text-xl leading-snug font-medium tracking-tight text-foreground md:text-2xl">
          {thread.type === "link" && thread.url ? (
            <a
              href={thread.url}
              className="transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {thread.title}
            </a>
          ) : (
            thread.title
          )}
        </h1>

        <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
          {thread.type === "link" && thread.url && (
            <>
              <a
                href={thread.url}
                className="text-orange-600 hover:underline dark:text-orange-400"
              >
                {domain(thread.url)}
              </a>
              <span aria-hidden="true">·</span>
            </>
          )}
          <a href={`/user/${thread.author}`} className={metadataLinkClass}>
            {thread.author}
          </a>
          <span aria-hidden="true">·</span>
          <span>{timeAgo(thread.createdAt)}</span>
        </p>

        {paragraphs.length > 0 && (
          <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-foreground/90">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        )}
      </article>

      <hr className="mt-10 border-border" />

      <p className="mt-6 text-sm text-muted-foreground">No comments yet.</p>
    </div>
  )
}
