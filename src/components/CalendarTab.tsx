import { useMemo, useState } from "react"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Calendar } from "@/components/Calendar"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/Button"
import type { GameSummary } from "@/lib/data"

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

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
    accessorKey: "spreadsheetLabel",
    header: "Source",
    enableSorting: false,
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

  return (
    <div>
      <div className="space-y-8 flex gap-12">
        <div>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) =>
              setSelectedDate(
                date && selectedDate && isSameDay(date, selectedDate)
                  ? undefined
                  : date
              )
            }
            modifiers={{ hasGames: gameDates }}
            modifiersClassNames={{
              hasGames:
                "relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:size-1 after:rounded-full after:bg-primary",
            }}
          />
        </div>
        <div className="overflow-hidden rounded-lg border bg-card w-full h-min">
          <DataTable
            columns={columns}
            data={filteredGames}
            emptyMessage={selectedDate ? "No games played today." : "No games submitted."}
          />
        </div>
      </div>
    </div>
  )
}
