import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowLeft, ArrowUpDown } from "lucide-react"
import { Calendar } from "@/components/Calendar"
import { DataTable } from "@/components/DataTable"
import { Button } from "@/components/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import {
  getPlayerGameDetails,
  getPlayerStats,
  type Data,
  type PlayerGameDetail,
} from "@/lib/data"
import { isSameDay } from "@/lib/utils"

function formatPlace(place: number): string {
  if (place === 1) return "1st"
  if (place === 2) return "2nd"
  if (place === 3) return "3rd"
  return `${place}th`
}

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const columns: ColumnDef<PlayerGameDetail>[] = [
  {
    accessorKey: "date",
    header: "Date",
    enableSorting: false,
    cell: ({ row }) => formatDate(row.original.date),
  },
  {
    accessorKey: "gameName",
    header: "Game",
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("gameName")}</span>
    ),
  },
  {
    accessorKey: "playerScore",
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
      <span className="text-right block">{row.getValue("playerScore")}</span>
    ),
  },
  {
    accessorKey: "place",
    header: "Place",
    enableSorting: false,
    cell: ({ row }) => formatPlace(row.getValue("place")),
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

interface PlayerDashboardProps {
  data: Data
}

export function PlayerDashboard({ data }: PlayerDashboardProps) {
  const { name } = useParams<{ name: string }>()
  const navigate = useNavigate()
  const playerName = decodeURIComponent(name ?? "")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)

  const games = useMemo(
    () => getPlayerGameDetails(data, playerName),
    [data, playerName]
  )

  const stats = useMemo(() => getPlayerStats(games), [games])

  const gameDates = useMemo(
    () => games.map((g) => g.date).filter((d): d is Date => d !== null),
    [games]
  )

  const filteredGames = useMemo(() => {
    if (!selectedDate) return games
    return games.filter(
      (g) => g.date !== null && isSameDay(g.date, selectedDate)
    )
  }, [games, selectedDate])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <h2 className="text-2xl font-bold">{playerName}</h2>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Avg Points / Game
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.avgPoints.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Total Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {stats.totalPoints.toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Games Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.gamesWon}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground font-normal">
              Win %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.winPct.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Game History</h3>
        <div className="flex gap-12">
          <div className="shrink-0">
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
              emptyMessage={
                selectedDate
                  ? "No games played on this date."
                  : "No games found."
              }
            />
          </div>
        </div>
      </div>
    </div>
  )
}
