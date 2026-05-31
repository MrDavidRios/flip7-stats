import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table"
import type { TabData } from "@/lib/data"

interface GameTableProps {
  game: TabData
}

export function GameTable({ game }: GameTableProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            {game.headers.map((h, i) => (
              <TableHead key={i}>{h}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {game.rows.map((row, ri) => (
            <TableRow key={ri}>
              {game.headers.map((_, ci) => (
                <TableCell key={ci}>
                  {row[ci] === "0" ? "" : (row[ci] ?? "")}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
