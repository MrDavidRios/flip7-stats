import { useMemo, useRef, useState, type ReactNode } from "react"
import { CalendarDays, ChevronRight } from "lucide-react"
import { BottomSheet } from "@/components/BottomSheet"
import { GameCalendar } from "@/components/GameCalendar"
import { dayKey, groupByDay } from "@/lib/gameList"
import { cn } from "@/lib/utils"

interface DayGroupedListProps<T> {
  /** Items already sorted newest first. */
  items: T[]
  getDate: (item: T) => Date | null
  getKey: (item: T) => string
  renderItem: (item: T) => ReactNode
  onSelect: (item: T) => void
  summary: string
  emptyMessage: string
  className?: string
}

/**
 * The phone version of a game history: games grouped under sticky day
 * headings, with the calendar tucked into a "Jump to date" sheet instead of
 * taking the first screen.
 */
export function DayGroupedList<T>({
  items,
  getDate,
  getKey,
  renderItem,
  onSelect,
  summary,
  emptyMessage,
  className,
}: DayGroupedListProps<T>) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null)
  const pendingJump = useRef<string | null>(null)
  const groups = useMemo(() => groupByDay(items, getDate), [items, getDate])
  const dates = useMemo(
    () => groups.map((g) => g.date).filter((d): d is Date => d !== null),
    [groups]
  )

  function jumpTo(date: Date | undefined) {
    if (!date) return
    pendingJump.current = dayKey(date)
    setSheetOpen(false)
  }

  // Scroll only after the sheet has finished closing, so the scroll lock it
  // holds on the page is released first.
  function handleSheetSettled(open: boolean) {
    const key = pendingJump.current
    if (open || !key) return
    pendingJump.current = null
    document.getElementById(`day-${key}`)?.scrollIntoView({ behavior: "smooth", block: "start" })
    setHighlightedKey(key)
    window.setTimeout(() => setHighlightedKey((k) => (k === key ? null : k)), 1400)
  }

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{summary}</p>
        {dates.length > 0 && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-lg border border-foreground/10 bg-card px-3.5 text-sm font-medium text-foreground active:bg-muted"
          >
            <CalendarDays className="size-4" />
            Jump to date
          </button>
        )}
      </div>

      {groups.length === 0 && (
        <p className="rounded-lg border border-foreground/10 bg-card p-6 text-center text-sm">
          {emptyMessage}
        </p>
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <section
            key={group.key}
            id={`day-${group.key}`}
            aria-labelledby={`day-${group.key}-label`}
            className={cn(
              "scroll-mt-2 rounded-lg border border-foreground/10 bg-card ring-0 ring-primary/50 transition-shadow duration-500",
              highlightedKey === group.key && "ring-2"
            )}
          >
            <h3
              id={`day-${group.key}-label`}
              className="sticky top-0 z-10 flex h-10 items-center justify-between rounded-t-lg border-b border-foreground/10 bg-muted px-4 text-sm font-semibold text-foreground"
            >
              <span>
                {group.date
                  ? group.date.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Undated"}
              </span>
              <span className="font-normal text-foreground/70">
                {group.items.length} {group.items.length === 1 ? "game" : "games"}
              </span>
            </h3>
            <ul className="divide-y divide-foreground/10">
              {group.items.map((item) => (
                <li key={getKey(item)} className="last:*:rounded-b-lg">
                  <button
                    type="button"
                    onClick={() => onSelect(item)}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left active:bg-muted/60"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-3">
                      {renderItem(item)}
                    </span>
                    <ChevronRight aria-hidden className="size-4 shrink-0 text-foreground/40" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <BottomSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onOpenChangeComplete={handleSheetSettled}
        title="Jump to a game day"
      >
        <GameCalendar
          gameDates={dates}
          selectedDate={undefined}
          onSelectedDateChange={jumpTo}
          className="bg-transparent p-0"
        />
      </BottomSheet>
    </div>
  )
}
