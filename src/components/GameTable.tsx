import { useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/Table"
import type { TabData } from "@/lib/data"
import { cn } from "@/lib/utils"

interface GameTableProps {
  game: TabData
}

/**
 * The desktop round-by-round table, styled to match the phone grid: muted
 * header, faint zebra rows, each round's top score in the primary color, and
 * zeros as faint dashes.
 */
export function GameTable({ game }: GameTableProps) {
  const best = useMemo(
    () =>
      game.headers.map((_, ci) =>
        ci < 2 ? 0 : Math.max(0, ...game.rows.map((r) => Number(r[ci] ?? "") || 0))
      ),
    [game]
  )

  return (
    <div className="overflow-hidden rounded-lg border border-foreground/10 bg-card">
      <Table className="tabular-nums">
        <TableHeader>
          <TableRow className="odd:bg-muted hover:bg-muted">
            {game.headers.map((h, i) => (
              <TableHead
                key={i}
                className={cn(
                  "border-b border-foreground/10 px-3 text-xs",
                  i < 2 ? "font-semibold text-foreground" : "text-right text-foreground/70"
                )}
              >
                {h}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {game.rows.map((row, ri) => (
            <TableRow
              key={ri}
              className="odd:bg-transparent even:bg-foreground/[0.03] hover:bg-foreground/[0.06]"
            >
              {game.headers.map((_, ci) => {
                const cell = row[ci] ?? ""
                if (ci === 0) {
                  return (
                    <TableCell key={ci} className="px-3 font-medium">
                      {cell}
                    </TableCell>
                  )
                }
                if (ci === 1) {
                  return (
                    <TableCell key={ci} className="px-3 font-bold">
                      {cell}
                    </TableCell>
                  )
                }
                const score = Number(cell) || 0
                return (
                  <TableCell
                    key={ci}
                    className={cn(
                      "px-3 text-right",
                      score === 0 && "text-foreground/35",
                      score > 0 && score === best[ci] && "font-semibold text-primary"
                    )}
                  >
                    {score === 0 ? <span aria-label="0">–</span> : cell}
                  </TableCell>
                )
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
