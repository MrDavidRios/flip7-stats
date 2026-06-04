import { useMemo } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Trophy } from "lucide-react"
import { Button } from "@/components/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { GameTable } from "@/components/GameTable"
import { getGameDetail, type Data, type GameSummary } from "@/lib/data"

function formatPlace(place: number): string {
  if (place === 1) return "1st"
  if (place === 2) return "2nd"
  if (place === 3) return "3rd"
  return `${place}th`
}

function formatDate(date: Date | null): string {
  if (!date) return "—"
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

interface GameDetailViewProps {
  data: Data
  games: GameSummary[]
}

export function GameDetailView({ data, games }: GameDetailViewProps) {
  const { index } = useParams<{ index: string }>()
  const navigate = useNavigate()

  const gameSummary = games.find((g) => g.index === Number(index))

  const game = useMemo(
    () =>
      gameSummary
        ? getGameDetail(data, gameSummary.name, gameSummary.spreadsheetLabel)
        : null,
    [data, gameSummary]
  )

  if (!game) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="size-5" />
          </Button>
          <h2 className="text-2xl font-bold">Game not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{game.name}</h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(game.date)} · {game.spreadsheetLabel}
          </p>
        </div>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {game.players.map((player) => (
          <Card key={player.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground font-normal flex items-center gap-1.5">
                {player.place === 1 && <Trophy className="size-3.5" />}
                {formatPlace(player.place)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold">{player.name}</p>
              <p className="text-sm text-muted-foreground">
                {player.score} points
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Round-by-Round</h3>
        <GameTable game={game.tab} />
      </div>
    </div>
  )
}
