/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */

export const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001"

export interface Thread {
  id: number
  type: "text" | "link"
  title: string
  url: string | null
  author: string
  topic: string
  createdAt: string
}

export interface Topic {
  id: number
  name: string
  status: "pending" | "done" | "failed"
  generationError: string | null
  createdAt: string
  threadCount: number
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    // Fastify rejects an empty body declared as JSON, so only set it with a body
    headers: init.body ? { "content-type": "application/json" } : undefined,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(response.status, body?.message ?? response.statusText)
  }

  return response.status === 204 ? (undefined as T) : response.json()
}

export function getThreads() {
  return api<Thread[]>("/threads", { cache: "no-store" })
}
