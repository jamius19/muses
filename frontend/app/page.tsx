/*
 * Author: Jamius Siam
 * Since: 16/09/2026
 */
import { ThemeToggle } from "@/components/theme-toggle"
import { getThreads } from "@/lib/api"
import { timeAgo } from "@/lib/time"
import { domain } from "@/lib/url"

const metadataLinkClass =
  "transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

export default async function Page() {
  const threads = await getThreads()

  const now = new Date()
  const weekday = now.toLocaleDateString("en-US", { weekday: "long" })
  const day = now.getDate()
  const month = now.toLocaleDateString("en-US", { month: "long" })
  const year = now.getFullYear()

  return (
    <div className="mx-auto min-h-svh max-w-2xl px-4 md:px-6 md:pt-8 pt-6 pb-16">
      <ThemeToggle />
      <header className="flex items-center justify-between">
        <img
          className="h-[28px] w-auto"
          src="https://i.postimg.cc/Y25G5VHW/logoipsum-395.png"
        ></img>

        <div className="relative top-1 flex flex-col">
          <p className="relative bottom-0.5 text-[0.83rem] font-medium leading-3">{weekday}</p>
          <p className="relative top-0.5 text-xs font-normal text-foreground/80">
            {day} {month} {year}
          </p>
        </div>
      </header>

      <hr className="mt-6 border-border" />

      {threads.length === 0 && (
        <p className="mt-6 text-sm text-muted-foreground">No threads yet.</p>
      )}

      <ol className="mt-6 space-y-5">
        {threads.map((thread, index) => (
          <li key={thread.id} className="flex gap-3 text-sm">
            <span className="w-3.5 shrink-0 pt-0.5 text-right text-muted-foreground">
              {index + 1}.
            </span>
            <div className="min-w-0">
              <a
                href={thread.url ?? `/thread/${thread.id}`}
                className="text-[15px] leading-snug font-normal text-foreground transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {thread.title}
              </a>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
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
                <a
                  href={`/user/${thread.author}`}
                  className={metadataLinkClass}
                >
                  {thread.author}
                </a>
                <span aria-hidden="true">·</span>
                <span>{timeAgo(thread.createdAt)}</span>
                <span aria-hidden="true">·</span>
                <a href={`/thread/${thread.id}`} className={metadataLinkClass}>
                  discuss
                </a>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
