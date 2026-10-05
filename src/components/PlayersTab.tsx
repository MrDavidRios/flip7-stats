import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { motion, MotionConfig, type Transition } from "motion/react"
import { SegmentedControl } from "@/components/SegmentedControl"
import { getPlayerBadges, type PlayerSummary } from "@/lib/data"

type SortKey = "totalScore" | "avgScore" | "gamesPlayed"

const SORTS: { key: SortKey; label: string; unit: string }[] = [
  { key: "totalScore", label: "Points", unit: "pts" },
  { key: "avgScore", label: "Avg / game", unit: "avg" },
  { key: "gamesPlayed", label: "Games", unit: "games" },
]

// Slide rows/cards to their new spot when the ranking changes.
const reorderTransition: Transition = { type: "spring", duration: 0.35, bounce: 0 }

const numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })

function playerPath(name: string) {
  return `/players/${encodeURIComponent(name)}`
}

interface PlayersTabProps {
  players: PlayerSummary[]
}

export function PlayersTab({ players }: PlayersTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>("totalScore")

  const sorted = useMemo(
    () =>
      [...players].sort(
        (a, b) => b[sortKey] - a[sortKey] || b.totalScore - a.totalScore
      ),
    [players, sortKey]
  )

  const badges = useMemo(() => getPlayerBadges(players), [players])

  const sort = SORTS.find((s) => s.key === sortKey)!

  return (
    <MotionConfig reducedMotion="user" transition={reorderTransition}>
      <div>
        <div className="mb-4 flex items-center gap-3">
          <span id="rank-by" className="text-sm text-foreground/70">
            Rank by
          </span>
          <SegmentedControl
            aria-labelledby="rank-by"
            className="h-11 flex-1 *:flex-1 md:h-8 md:flex-none"
            options={SORTS.map((s) => ({ value: s.key, label: s.label }))}
            value={sortKey}
            onChange={setSortKey}
          />
        </div>

        <ol className="divide-y divide-foreground/10 rounded-lg border border-foreground/10 bg-card">
          {sorted.map((player, i) => (
            <motion.li
              key={player.name}
              layout="position"
              className="first:*:rounded-t-lg last:*:rounded-b-lg"
            >
              <Link
                to={playerPath(player.name)}
                className="flex min-h-14 items-center gap-3 pl-2 pr-4 py-2.5 text-foreground no-underline hover:bg-muted/60 active:bg-muted/60"
              >
                <span className="w-6 shrink-0 text-center text-sm tabular-nums text-foreground/60">
                  {i + 1}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  {badges.has(player.name) && (
                    <span className="mb-1 flex flex-wrap gap-1">
                      {badges.get(player.name)!.map((badge) => (
                        <span
                          key={badge.key}
                          className="rounded-full bg-muted px-2 py-0.5 text-[11px] leading-none font-medium text-foreground/80 tabular-nums"
                        >
                          {badge.label} · {player[badge.key]}
                        </span>
                      ))}
                    </span>
                  )}
                  <span className="truncate font-medium">{player.name}</span>
                  <span className="text-xs text-foreground/70 tabular-nums">
                    {SORTS.filter((s) => s.key !== sortKey)
                      .map((s) => `${numberFormat.format(player[s.key])} ${s.unit}`)
                      .join(" · ")}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-semibold tabular-nums">
                    {numberFormat.format(player[sortKey])}
                  </span>
                  <span className="block text-xs text-foreground/70">{sort.unit}</span>
                </span>
                <ChevronRight aria-hidden className="size-4 shrink-0 text-foreground/40" />
              </Link>
            </motion.li>
          ))}
        </ol>
      </div>
    </MotionConfig>
  )
}
