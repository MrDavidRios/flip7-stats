import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { GameCalendar } from "@/components/GameCalendar"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/Button"
import { DayGroupedList } from "@/components/DayGroupedList"
import { gamePath, type GameSummary } from "@/lib/data"
import { compareNewest, shortGameName } from "@/lib/gameList"
import { isSameDay } from "@/lib/utils"

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

const gameDate = (game: GameSummary) => game.date
const gameKey = (game: GameSummary) => `${game.spreadsheetId}/${game.gid}`

interface CalendarTabProps {
  games: GameSummary[]
}

export function CalendarTab({ games }: CalendarTabProps) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const sortedGames = useMemo(() => [...games].sort(compareNewest), [games])

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
      <DayGroupedList
        className="md:hidden"
        items={sortedGames}
        getDate={gameDate}
        getKey={gameKey}
        onSelect={(game) => navigate(gamePath(game.spreadsheetId, game.gid))}
        summary={`${games.length} ${games.length === 1 ? "game" : "games"} · newest first`}
        emptyMessage="No games submitted."
        renderItem={(game) => (
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium break-words text-foreground">
              {shortGameName(game.name, game.date)}
            </span>
            <span className="text-sm text-foreground/70">
              <span className="font-semibold text-foreground">{game.winner}</span>{" "}
              won with <span className="tabular-nums">{game.winnerScore}</span> ·{" "}
              {game.playerCount} players
            </span>
          </span>
        )}
      />
    </div>
  )
}
