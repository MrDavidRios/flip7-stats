import { useState } from "react"
import { Calendar } from "@/components/Calendar"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table"
import type { GameSummary } from "@/lib/data"

interface CalendarTabProps {
  games: GameSummary[]
}

export function CalendarTab({ games }: CalendarTabProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
        />
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-foreground">
          Recent Games
        </h2>
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Game</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Winner</TableHead>
                <TableHead className="text-right">Score</TableHead>
                <TableHead className="text-right">Players</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{game.name}</TableCell>
                  <TableCell>{game.spreadsheetLabel}</TableCell>
                  <TableCell>{game.winner}</TableCell>
                  <TableCell className="text-right">{game.winnerScore}</TableCell>
                  <TableCell className="text-right">{game.playerCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
