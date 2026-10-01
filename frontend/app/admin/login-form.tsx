/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */
"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { api } from "@/lib/api"

export function LoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)

    setPending(true)
    setError(null)
    try {
      await api("/admin/login", {
        method: "POST",
        body: JSON.stringify({
          username: form.get("username"),
          password: form.get("password"),
        }),
      })
      onLoggedIn()
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-6 flex max-w-xs flex-col gap-3">
      <Input
        name="username"
        placeholder="Username"
        autoComplete="username"
        required
      />
      <Input
        name="password"
        type="password"
        placeholder="Password"
        autoComplete="current-password"
        required
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  )
}
