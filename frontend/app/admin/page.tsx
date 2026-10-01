/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
"use client"

import { useCallback, useEffect, useState } from "react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api, ApiError, type Thread, type Topic } from "@/lib/api"
import { timeAgo } from "@/lib/time"

import { LoginForm } from "./login-form"

type Status = "loading" | "anonymous" | "authenticated"

export default function AdminPage() {
  const [status, setStatus] = useState<Status>("loading")
  const [topics, setTopics] = useState<Topic[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [topicName, setTopicName] = useState("")
  const [generatingId, setGeneratingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleError = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      setStatus("anonymous")
    } else {
      setError(error instanceof Error ? error.message : String(error))
    }
  }, [])

  const load = useCallback(
    () =>
      Promise.all([
        api<Topic[]>("/admin/topics"),
        api<Thread[]>("/admin/threads"),
      ])
        .then(([topics, threads]) => {
          setTopics(topics)
          setThreads(threads)
          setStatus("authenticated")
        })
        .catch(handleError),
    [handleError]
  )

  useEffect(() => {
    load()
  }, [load])

  async function run(action: () => Promise<unknown>) {
    setError(null)
    try {
      await action()
      await load()
    } catch (error) {
      handleError(error)
    }
  }

  async function addTopic(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await run(async () => {
      await api("/admin/topics", {
        method: "POST",
        body: JSON.stringify({ name: topicName }),
      })
      setTopicName("")
    })
  }

  async function generate(topic: Topic) {
    setGeneratingId(topic.id)
    await run(() =>
      api(`/admin/topics/${topic.id}/generate`, { method: "POST" })
    )
    setGeneratingId(null)
  }

  async function deleteThread(thread: Thread) {
    if (!confirm(`Delete "${thread.title}"?`)) {
      return
    }
    await run(() => api(`/admin/threads/${thread.id}`, { method: "DELETE" }))
  }

  async function logout() {
    // The reload that follows gets a 401, which switches back to the login form
    await run(() => api("/admin/logout", { method: "POST" }))
  }

  return (
    <div className="mx-auto min-h-svh max-w-2xl px-4 pt-6 pb-16 md:px-6 md:pt-8">
      <ThemeToggle />
      <header className="flex items-center justify-between">
        <h1 className="font-heading text-lg font-medium">Admin</h1>
        {status === "authenticated" && (
          <Button variant="ghost" size="sm" onClick={logout}>
            Log out
          </Button>
        )}
      </header>

      <hr className="mt-6 border-border" />

      {status === "loading" && (
        <p className="mt-6 text-sm text-muted-foreground">Loading…</p>
      )}

      {status === "anonymous" && <LoginForm onLoggedIn={load} />}

      {status === "authenticated" && (
        <>
          {error && <p className="mt-6 text-sm text-destructive">{error}</p>}

          <section className="mt-6">
            <h2 className="text-sm font-medium">Topics</h2>
            <form onSubmit={addTopic} className="mt-3 flex gap-2">
              <Input
                value={topicName}
                onChange={(event) => setTopicName(event.target.value)}
                placeholder="New topic, e.g. Unity"
                maxLength={100}
                required
              />
              <Button type="submit">Add</Button>
            </form>

            <ul className="mt-3 divide-y divide-border">
              {topics.map((topic) => (
                <li
                  key={topic.id}
                  className="flex items-center justify-between gap-3 py-2 text-sm"
                >
                  <span>
                    {topic.name}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {topic.threadCount} threads
                    </span>
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={generatingId !== null}
                    onClick={() => generate(topic)}
                  >
                    {generatingId === topic.id ? "Generating…" : "Generate"}
                  </Button>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8">
            <h2 className="text-sm font-medium">Threads</h2>
            {threads.length === 0 && (
              <p className="mt-3 text-sm text-muted-foreground">
                No threads yet.
              </p>
            )}
            <ul className="mt-3 divide-y divide-border">
              {threads.map((thread) => (
                <li
                  key={thread.id}
                  className="flex items-center justify-between gap-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm">{thread.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {thread.topic} · {thread.author} ·{" "}
                      {timeAgo(thread.createdAt)}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteThread(thread)}
                  >
                    Delete
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  )
}
