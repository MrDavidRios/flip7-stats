const DATE_IN_NAME = /,?\s*(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})\s*,?\s*/

/**
 * Once games are grouped under a date heading, the date inside the sheet's
 * tab name is redundant: "2026-07-25, game 3" reads as "Game 3". Names
 * without a parseable date are shown as-is.
 */
export function shortGameName(name: string, date: Date | null): string {
  if (!date) return name
  const short = name
    .replace(DATE_IN_NAME, " ")
    .trim()
    .replace(/\bgame\b/i, "Game")
  return short || "Game"
}

export function dayKey(date: Date | null): string {
  if (!date) return "undated"
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

/** Newest day first, undated last, then by name within a day. */
export function compareNewest(
  a: { date: Date | null; name: string },
  b: { date: Date | null; name: string }
): number {
  if (a.date && b.date && a.date.getTime() !== b.date.getTime()) {
    return b.date.getTime() - a.date.getTime()
  }
  if (a.date && !b.date) return -1
  if (!a.date && b.date) return 1
  return a.name.localeCompare(b.name, undefined, { numeric: true })
}

export interface DayGroup<T> {
  key: string
  date: Date | null
  items: T[]
}

/** Groups consecutive items that share a day; expects items already sorted. */
export function groupByDay<T>(items: T[], getDate: (item: T) => Date | null): DayGroup<T>[] {
  const groups: DayGroup<T>[] = []
  for (const item of items) {
    const date = getDate(item)
    const key = dayKey(date)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.items.push(item)
    else groups.push({ key, date, items: [item] })
  }
  return groups
}
