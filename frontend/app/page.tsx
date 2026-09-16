/*
 * Author: Jamius Siam
 * Since: 16/09/2026
 */
import { ThemeToggle } from "@/components/theme-toggle"
import { homepageData } from "@/lib/homepage-data"

const metadataLinkClass =
  "transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

export default function Page() {
  const { weekday, day, month, year, stories } = homepageData

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

      <ol className="mt-6 space-y-5">
        {stories.map((story, index) => (
          <li key={story.id} className="flex gap-3 text-sm">
            <span className="w-3.5 shrink-0 pt-0.5 text-right text-muted-foreground">
              {index + 1}.
            </span>
            <div className="min-w-0">
              <a
                href={story.titleHref ?? story.commentsHref}
                className="text-[15px] leading-snug font-normal text-foreground transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                {story.title}
              </a>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-muted-foreground">
                {story.source && (
                  <>
                    <a
                      href={story.sourceHref ?? "#"}
                      className="text-orange-600 hover:underline dark:text-orange-400"
                    >
                      {story.source}
                    </a>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <span>{story.points} points</span>
                <span aria-hidden="true">·</span>
                <a href={story.authorHref} className={metadataLinkClass}>
                  {story.author}
                </a>
                <span aria-hidden="true">·</span>
                <span>{story.age}</span>
                <span aria-hidden="true">·</span>
                <a href={story.commentsHref} className={metadataLinkClass}>
                  {story.commentCount} comments
                </a>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}
