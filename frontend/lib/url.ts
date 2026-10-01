/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */

// "https://www.example.com/a/b" -> "example.com"
export function domain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, "")
}
