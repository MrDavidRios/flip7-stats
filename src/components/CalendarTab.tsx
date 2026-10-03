import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Calendar } from "@/components/Calendar"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/Button"
import type { GameSummary } from "@/lib/data"
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

interface CalendarTabProps {
  games: GameSummary[]
}

export function CalendarTab({ games }: CalendarTabProps) {
  const navigate = useNavigate()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const gameDates = useMemo(
    () =>
      games
        .map((g) => g.date)
        .filter((d): d is Date => d !== null),
    [games]
  )

  const filteredGames = useMemo(() => {
    if (!selectedDate) return games
    return games.filter(
      (g) => g.date !== null && isSameDay(g.date, selectedDate)
    )
  }, [games, selectedDate])

  const emptyMessage = selectedDate
    ? `No games played on ${selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}.`
    : "No games submitted."

  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-12">
        <div className="md:shrink-0">
          <Calendar
            mode="single"
            startMonth={
              gameDates.length
                ? new Date(Math.min(...gameDates.map((d) => d.getTime())))
                : undefined
            }
            defaultMonth={
              gameDates.length
                ? new Date(Math.max(...gameDates.map((d) => d.getTime())))
                : undefined
            }
            selected={selectedDate}
            onSelect={(date) =>
              setSelectedDate(
                date && selectedDate && isSameDay(date, selectedDate)
                  ? undefined
                  : date
              )
            }
            disabled={(date) => !gameDates.some((d) => isSameDay(d, date))}
          />
        </div>
        <div className="hidden overflow-hidden rounded-lg border bg-card w-full h-min md:block">
          <DataTable
            columns={columns}
            data={filteredGames}
            emptyMessage={emptyMessage}
            onRowClick={(game) => navigate(`/games/${game.index}`)}
          />
        </div>
        <ul className="overflow-hidden rounded-lg border bg-card md:hidden">
          {filteredGames.length === 0 && (
            <li className="p-6 text-center text-sm">{emptyMessage}</li>
          )}
          {filteredGames.map((game) => (
            <li key={game.index} className="odd:bg-muted/30">
              <button
                type="button"
                onClick={() => navigate(`/games/${game.index}`)}
                className="flex min-h-14 w-full flex-col gap-0.5 px-4 py-3 text-left active:bg-muted/50"
              >
                <span className="font-medium break-words">{game.name}</span>
                <span className="text-sm text-muted-foreground">
                  {game.winner} won with {game.winnerScore} · {game.playerCount} players
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
