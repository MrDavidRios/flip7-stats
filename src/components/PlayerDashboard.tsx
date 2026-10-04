import { useMemo, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowLeft, ArrowUpDown, Trophy } from "lucide-react"
import { GameCalendar } from "@/components/GameCalendar"
import { DataTable } from "@/components/DataTable"
import { DayGroupedList } from "@/components/DayGroupedList"
import { Button } from "@/components/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import {
  gamePath,
  getPlayerGameDetails,
  getPlayerStats,
  type Data,
  type PlayerGameDetail,
} from "@/lib/data"
import { compareNewest, shortGameName } from "@/lib/gameList"
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

const historyDate = (game: PlayerGameDetail) => game.date
const historyKey = (game: PlayerGameDetail) => `${game.spreadsheetId}/${game.gid}`
const byNewestGame = (a: PlayerGameDetail, b: PlayerGameDetail) =>
  compareNewest({ date: a.date, name: a.gameName }, { date: b.date, name: b.gameName })

function HistoryRow({ game }: { game: PlayerGameDetail }) {
  return (
    <>
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="font-medium break-words text-foreground">
          {shortGameName(game.gameName, game.date)}
        </span>
        <span className="flex items-center gap-1 text-sm text-foreground/70">
          {game.won ? (
            <>
              <Trophy aria-hidden className="size-3.5 text-foreground" />
              <span className="font-semibold text-foreground">Won</span> · {game.playerCount} players
            </>
          ) : (
            <>
              {formatPlace(game.place)} of {game.playerCount}
            </>
          )}
        </span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block font-semibold tabular-nums text-foreground">{game.playerScore}</span>
        <span className="block text-xs text-foreground/70">pts</span>
      </span>
    </>
  )
}

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
  const newestFirst = useMemo(() => [...games].sort(byNewestGame), [games])

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
      <div className="-ml-2 flex items-center gap-1 md:ml-0 md:gap-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Back"
          className="size-11 shrink-0 md:size-8"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold md:text-2xl">{playerName}</h2>
          <p className="text-sm text-muted-foreground md:hidden">
            {stats.gamesPlayed} {stats.gamesPlayed === 1 ? "game" : "games"} played
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 rounded-lg border bg-card md:hidden">
        {[
          { label: "Avg / game", value: stats.avgPoints.toFixed(1) },
          { label: "Total points", value: stats.totalPoints.toLocaleString() },
          { label: "Wins", value: stats.gamesWon, detail: `of ${stats.gamesPlayed}` },
          { label: "Win rate", value: `${stats.winPct.toFixed(0)}%` },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={
              "flex flex-col gap-0.5 px-4 py-3 border-foreground/10 " +
              (i % 2 === 0 ? "border-r " : "") +
              (i < 2 ? "border-b" : "")
            }
          >
            <dt className="text-xs text-foreground/70">{stat.label}</dt>
            <dd className="text-xl font-bold tabular-nums text-foreground">
              {stat.value}
              {stat.detail && (
                <span className="ml-1 text-sm font-normal text-foreground/70">{stat.detail}</span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
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
        <h3 className="text-lg font-semibold mb-3 md:mb-4">Game History</h3>
        <DayGroupedList
          className="md:hidden"
          items={newestFirst}
          getDate={historyDate}
          getKey={historyKey}
          onSelect={(game) => navigate(gamePath(game.spreadsheetId, game.gid))}
          summary="Newest first"
          emptyMessage="No games found."
          renderItem={(game) => <HistoryRow game={game} />}
        />
        <div className="hidden gap-12 md:flex">
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
              onRowClick={(game) => navigate(gamePath(game.spreadsheetId, game.gid))}
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
