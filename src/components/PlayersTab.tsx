import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import type { PlayerSummary } from "@/lib/data"

interface PlayersTabProps {
  players: PlayerSummary[]
}

export function PlayersTab({ players }: PlayersTabProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <Card key={player.name}>
          <CardHeader>
            <CardTitle>{player.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-2 text-sm">
              <dt className="text-muted-foreground">Games played</dt>
              <dd className="text-right font-medium">{player.gamesPlayed}</dd>
              <dt className="text-muted-foreground">Total points scored</dt>
              <dd className="text-right font-medium">{player.totalScore}</dd>
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
