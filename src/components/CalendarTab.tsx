import { useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, CalendarDays, ChevronRight } from "lucide-react"
import { GameCalendar } from "@/components/GameCalendar"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/Button"
import { BottomSheet } from "@/components/BottomSheet"
import { gamePath, type GameSummary } from "@/lib/data"
import { cn, isSameDay } from "@/lib/utils"

const columns: ColumnDef<GameSummary>[] = [
  {
    accessorKey: "name",
    header: "Game",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name")}</span>
    ),
  },
  {
    accessorKey: "winner",
    header: "Winner",
    enableSorting: false,
  },
  {
    accessorKey: "winnerScore",
    header: ({ column }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Score
          <ArrowUpDown className="ml-1 size-3.5" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <span className="text-right block">{row.getValue("winnerScore")}</span>
    ),
  },
  {
    accessorKey: "playerCount",
    header: ({ column }) => (
      <div className="flex justify-end">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Players
          <ArrowUpDown className="ml-1 size-3.5" />
        </Button>
      </div>
    ),
    cell: ({ row }) => (
      <span className="text-right block">{row.getValue("playerCount")}</span>
    ),
  },
]

const DATE_IN_NAME = /,?\s*(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})\s*,?\s*/

/**
 * Once games are grouped under a date heading, the date inside the sheet's
 * tab name is redundant: "2026-07-25, game 3" reads as "Game 3". Names
 * without a parseable date are shown as-is.
 */
function shortGameName(game: GameSummary): string {
  if (!game.date) return game.name
  const short = game.name
    .replace(DATE_IN_NAME, " ")
    .trim()
    .replace(/\bgame\b/i, "Game")
  return short || "Game"
}

function dayKey(date: Date | null): string {
  if (!date) return "undated"
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function byNewest(a: GameSummary, b: GameSummary): number {
  if (a.date && b.date && a.date.getTime() !== b.date.getTime()) {
    return b.date.getTime() - a.date.getTime()
  }
  if (a.date && !b.date) return -1
  if (!a.date && b.date) return 1
  return a.name.localeCompare(b.name, undefined, { numeric: true })
}

interface DayGroup {
  key: string
  date: Date | null
  games: GameSummary[]
}

function groupByDay(games: GameSummary[]): DayGroup[] {
  const groups: DayGroup[] = []
  for (const game of games) {
    const key = dayKey(game.date)
    const last = groups[groups.length - 1]
    if (last?.key === key) last.games.push(game)
    else groups.push({ key, date: game.date, games: [game] })
  }
  return groups
}

interface CalendarTabProps {
  games: GameSummary[]
}

export function CalendarTab({ games }: CalendarTabProps) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const sortedGames = useMemo(() => [...games].sort(byNewest), [games])

  const gameDates = useMemo(
    () =>
      games
        .map((g) => g.date)
        .filter((d): d is Date => d !== null),
    [games]
  )

  const filteredGames = useMemo(() => {
    if (!selectedDate) return sortedGames
    return sortedGames.filter(
      (g) => g.date !== null && isSameDay(g.date, selectedDate)
    )
  }, [sortedGames, selectedDate])

  const emptyMessage = selectedDate
    ? `No games played on ${selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
    : "No games submitted."

  return (
    <div>
      <div className="hidden md:flex md:flex-row md:items-start md:gap-12">
        <div className="shrink-0">
          <GameCalendar
            gameDates={gameDates}
            selectedDate={selectedDate}
            onSelectedDateChange={setSelectedDate}
          />
        </div>
        <div className="overflow-hidden rounded-lg border bg-card w-full h-min">
          <DataTable
            columns={columns}
            data={filteredGames}
            emptyMessage={emptyMessage}
            onRowClick={(game) => navigate(gamePath(game.spreadsheetId, game.gid))}
          />
        </div>
      </div>
      <MobileGameList games={sortedGames} gameDates={gameDates} />
    </div>
  )
}

interface MobileGameListProps {
  games: GameSummary[]
  gameDates: Date[]
}

function MobileGameList({ games, gameDates }: MobileGameListProps) {
  const navigate = useNavigate()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [highlightedKey, setHighlightedKey] = useState<string | null>(null)
  const pendingJump = useRef<string | null>(null)
  const groups = useMemo(() => groupByDay(games), [games])

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
    <div className="md:hidden">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {games.length} {games.length === 1 ? "game" : "games"} · newest first
        </p>
        {gameDates.length > 0 && (
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-foreground/10 bg-card px-3.5 text-sm font-medium text-foreground active:bg-muted"
          >
            <CalendarDays className="size-4" />
            Jump to date
          </button>
        )}
      </div>

      {groups.length === 0 && (
        <p className="rounded-lg border bg-card p-6 text-center text-sm">
          No games submitted.
        </p>
      )}

      <div className="space-y-4">
        {groups.map((group) => (
          <section
            key={group.key}
            id={`day-${group.key}`}
            aria-labelledby={`day-${group.key}-label`}
            className={cn(
              "scroll-mt-2 rounded-lg border bg-card ring-0 ring-primary/50 transition-shadow duration-500",
              highlightedKey === group.key && "ring-2"
            )}
          >
            <h3
              id={`day-${group.key}-label`}
              className="sticky top-0 z-10 flex h-10 items-center justify-between rounded-t-lg border-b bg-muted px-4 text-sm font-semibold text-foreground"
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
                {group.games.length} {group.games.length === 1 ? "game" : "games"}
              </span>
            </h3>
            <ul className="divide-y divide-foreground/10">
              {group.games.map((game) => (
                <li key={`${game.spreadsheetId}/${game.gid}`} className="last:*:rounded-b-lg">
                  <button
                    type="button"
                    onClick={() => navigate(gamePath(game.spreadsheetId, game.gid))}
                    className="flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left active:bg-muted/60"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="font-medium break-words text-foreground">
                        {shortGameName(game)}
                      </span>
                      <span className="text-sm text-foreground/70">
                        <span className="font-semibold text-foreground">{game.winner}</span>{" "}
                        won with <span className="tabular-nums">{game.winnerScore}</span> ·{" "}
                        {game.playerCount} players
                      </span>
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
          gameDates={gameDates}
          selectedDate={undefined}
          onSelectedDateChange={jumpTo}
          className="bg-transparent p-0"
        />
      </BottomSheet>
    </div>
  )
}
