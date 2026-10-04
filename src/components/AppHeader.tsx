import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

interface AppHeaderProps {
  fetchedAt: string
}

const relativeFormat = new Intl.RelativeTimeFormat("en-US", { numeric: "auto" })

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
]

function formatUpdated(date: Date, now: number): string {
  const elapsed = now - date.getTime()
  if (elapsed < 60_000) return "Updated just now"
  for (const [unit, ms] of UNITS) {
    if (elapsed >= ms) {
      return `Updated ${relativeFormat.format(-Math.floor(elapsed / ms), unit)}`
    }
  }
  return "Updated just now"
}

export function AppHeader({ fetchedAt }: AppHeaderProps) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const updated = fetchedAt ? new Date(fetchedAt) : null

  return (
    <header className="mb-5 flex items-center justify-between gap-4 md:mb-7">
      <Link
        to="/"
        aria-label="Flip 7 Stats home"
        className="flex items-center rounded-md font-florence text-2xl tracking-tight text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-4 md:text-[1.75rem]"
      >
        FLIP<span className="-ml-2 mr-1 pr-2 text-4xl italic md:text-[2.75rem]">7</span> STATS
      </Link>
      {updated && (
        <time
          dateTime={fetchedAt}
          title={updated.toLocaleString()}
          className="shrink-0 text-xs text-muted-foreground"
        >
          {formatUpdated(updated, now)}
        </time>
      )}
    </header>
  )
}
