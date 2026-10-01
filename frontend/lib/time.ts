/*
 * Author: Jamius Siam
 * Since: 02/10/2026
 */

const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60],
  ["month", 30 * 24 * 60 * 60],
  ["day", 24 * 60 * 60],
  ["hour", 60 * 60],
  ["minute", 60],
]

const formatter = new Intl.RelativeTimeFormat("en", { numeric: "always" })

export function timeAgo(date: string): string {
  const seconds = (Date.now() - new Date(date).getTime()) / 1000

  for (const [unit, size] of units) {
    if (seconds >= size) {
      return formatter.format(-Math.floor(seconds / size), unit)
    }
  }
  return "just now"
}
