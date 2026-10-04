import { useMemo } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { ArrowLeft, ChevronRight, StickyNote, Trophy } from "lucide-react"
import { Button } from "@/components/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { GameTable } from "@/components/GameTable"
import { getGameDetail, playerRows, type Data, type GameDetail } from "@/lib/data"
import { cn } from "@/lib/utils"

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

function playerPath(name: string): string {
  return `/players/${encodeURIComponent(name)}`
}

interface GameDetailViewProps {
  data: Data
}

export function GameDetailView({ data }: GameDetailViewProps) {
  const { spreadsheetId, gid } = useParams<{
    spreadsheetId: string
    gid: string
  }>()
  const navigate = useNavigate()

  const game = useMemo(
    () => getGameDetail(data, spreadsheetId ?? "", Number(gid)),
    [data, spreadsheetId, gid]
  )

  const backButton = (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Back"
      className="size-11 shrink-0 md:size-8"
      onClick={() => navigate(-1)}
    >
      <ArrowLeft className="size-5" />
    </Button>
  )

  if (!game) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          {backButton}
          <h2 className="text-2xl font-bold">Game not found</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="-ml-2 flex items-center gap-1 md:ml-0 md:gap-3">
        {backButton}
        <div className="min-w-0">
          <h2 className="text-xl font-bold md:text-2xl">{game.name}</h2>
          <p className="text-sm text-muted-foreground">
            {formatDate(game.date)} · {game.spreadsheetLabel}
          </p>
        </div>
      </div>

      <Standings game={game} />

      <div className="hidden gap-4 md:grid md:grid-cols-2 lg:grid-cols-4">
        {game.players.map((player) => (
          <Link
            key={player.name}
            to={playerPath(player.name)}
            className="no-underline"
          >
            <Card className="cursor-pointer transition-colors hover:brightness-95 h-full">
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
          </Link>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3 md:mb-4">Round-by-Round</h3>
        <div className="hidden md:block">
          <GameTable game={game.tab} />
        </div>
        <RoundGrid game={game} />
      </div>

      <Notes notes={game.tab.notes ?? []} />
    </div>
  )
}

/** Free-text notes from below the sheet's table, one card each. */
function Notes({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null

  return (
    <section>
      <h3 className="text-lg font-semibold mb-3 md:mb-4">Notes</h3>
      <ul className="grid gap-3 md:grid-cols-2 md:gap-4">
        {notes.map((note, i) => (
          <li key={i}>
            <Card className="h-full">
              <CardContent className="flex gap-3">
                <StickyNote aria-hidden className="mt-0.5 size-4 shrink-0 text-foreground/50" />
                <p className="whitespace-pre-line text-sm leading-relaxed">
                  {note.replace(/^note\s*:\s*/i, "")}
                </p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Standings({ game }: { game: GameDetail }) {
  const top = game.players[0]?.score || 1

  return (
    <ol className="divide-y divide-foreground/10 rounded-lg border border-foreground/10 bg-card md:hidden">
      {game.players.map((player) => {
        const won = player.place === 1
        return (
          <li key={player.name} className="first:*:rounded-t-lg last:*:rounded-b-lg">
            <Link
              to={playerPath(player.name)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-foreground no-underline active:bg-muted/60",
                won && "bg-featured-bg"
              )}
              >
              <span className="flex w-12 shrink-0 items-center gap-1 text-sm tabular-nums text-foreground/70">
                {won && <Trophy aria-label="Winner" className="size-3.5 text-foreground" />}
                {formatPlace(player.place)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className={cn("truncate", won ? "text-lg font-bold" : "font-medium")}>
                  {player.name}
                </span>
                <span aria-hidden className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                  <span
                    className="block h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(0, Math.min(100, (player.score / top) * 100))}%` }}
                  />
                </span>
              </span>
              <span className="w-12 shrink-0 text-right tabular-nums">
                <span className={cn("block", won ? "text-lg font-bold" : "font-semibold")}>
                  {player.score}
                </span>
              </span>
              <ChevronRight aria-hidden className="size-4 shrink-0 text-foreground/40" />
            </Link>
          </li>
        )
      })}
    </ol>
  )
}

/**
 * The round-by-round table, turned on its side for phones: players run
 * across (a game has at most ~7) and rounds run down, which is the direction
 * a phone already scrolls.
 */
function RoundGrid({ game }: { game: GameDetail }) {
  const { columns, rounds } = useMemo(() => {
    const byName = new Map(playerRows(game.tab).map((p) => [p.name, p.row]))
    const columns = game.players.map((p) => ({ ...p, row: byName.get(p.name) ?? [] }))
    const rounds = game.tab.headers.slice(2).map((header, i) => {
      const ci = i + 2
      const scores = columns.map((c) => Number(c.row[ci] ?? "") || 0)
      return { header, ci, scores, best: Math.max(...scores) }
    })
    return { columns, rounds }
  }, [game])

  return (
    <div className="rounded-lg border border-foreground/10 bg-card md:hidden">
      <table className="w-full table-fixed border-separate border-spacing-0 text-sm tabular-nums">
        <thead>
          <tr>
            <th scope="col" className="sticky top-0 z-10 w-11 rounded-tl-lg border-b border-foreground/10 bg-muted px-2 py-2.5 text-left text-xs font-medium text-foreground/70">
              <abbr title="Round" className="no-underline">Rd</abbr>
            </th>
            {columns.map((c, i) => (
              <th
                key={c.name}
                scope="col"
                title={c.name}
                className={cn(
                  "sticky top-0 z-10 truncate border-b border-foreground/10 bg-muted px-1 py-2.5 text-right text-xs font-semibold text-foreground",
                  i === columns.length - 1 && "rounded-tr-lg pr-3"
                )}
              >
                {c.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rounds.map((round) => (
            <tr key={round.ci} className="even:bg-foreground/[0.03]">
              <th scope="row" className="px-2 py-2 text-left text-xs font-normal text-foreground/70">
                {round.header.replace(/^round\s*/i, "")}
              </th>
              {round.scores.map((score, i) => {
                const best = score > 0 && score === round.best
                return (
                  <td
                    key={columns[i].name}
                    className={cn(
                      "px-1 py-2 text-right",
                      i === columns.length - 1 && "pr-3",
                      score === 0 && "text-foreground/35",
                      best && "font-semibold text-primary"
                    )}
                  >
                    {score === 0 ? <span aria-label="0">–</span> : score}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="rounded-bl-lg border-t-2 border-foreground/15 px-2 py-2.5 text-left text-xs font-semibold text-foreground">
              Total
            </th>
            {columns.map((c, i) => (
              <td
                key={c.name}
                className={cn(
                  "border-t-2 border-foreground/15 px-1 py-2.5 text-right font-bold text-foreground",
                  i === columns.length - 1 && "rounded-br-lg pr-3"
                )}
              >
                {c.score}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
