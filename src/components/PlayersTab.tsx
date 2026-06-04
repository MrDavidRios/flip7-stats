import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import type { PlayerSummary } from "@/lib/data"

interface PlayersTabProps {
  players: PlayerSummary[]
  onSelectPlayer: (name: string) => void
}

export function PlayersTab({ players, onSelectPlayer }: PlayersTabProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {players.map((player) => (
        <Card
          key={player.name}
          className="cursor-pointer transition-colors hover:brightness-95"
          onClick={() => onSelectPlayer(player.name)}
        >
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
