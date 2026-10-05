import { useMemo, useState } from "react"
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts"
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/Card"
import { SegmentedControl } from "@/components/SegmentedControl"
import { getRoundsDistribution, type Data, type RoundsBucket } from "@/lib/data"

type ChartView = "curve" | "bars"

const VIEWS: { value: ChartView; label: string }[] = [
  { value: "curve", label: "Curve" },
  { value: "bars", label: "Bars" },
]

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`
}

function RoundsTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  const bucket = payload?.[0]?.payload as RoundsBucket | undefined
  if (!active || !bucket) return null
  return (
    <div className="rounded-md border border-foreground/10 bg-background px-2.5 py-1.5 text-xs shadow-sm">
      <div className="font-medium text-foreground">{plural(bucket.rounds, "round")}</div>
      <div className="text-muted-foreground">{plural(bucket.games, "game")}</div>
    </div>
  )
}

function median(buckets: RoundsBucket[]): number {
  const values = buckets.flatMap((b) => Array<number>(b.games).fill(b.rounds))
  const mid = Math.floor(values.length / 2)
  return values.length % 2 ? values[mid] : (values[mid - 1] + values[mid]) / 2
}

function RoundsPerGameCard({ buckets }: { buckets: RoundsBucket[] }) {
  const [view, setView] = useState<ChartView>("curve")
  const totalGames = buckets.reduce((sum, b) => sum + b.games, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rounds per game</CardTitle>
        <CardDescription>
          {plural(totalGames, "game")} · median {median(buckets)} rounds
        </CardDescription>
        <CardAction>
          <SegmentedControl
            aria-label="Chart style"
            options={VIEWS}
            value={view}
            onChange={setView}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="h-64 md:h-72" aria-hidden="true">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={buckets}
              margin={{ top: 8, right: 8, bottom: 16, left: -16 }}
              barCategoryGap={2}
            >
              <defs>
                <linearGradient id="rounds-fill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--foreground)" strokeOpacity={0.08} />
              <XAxis
                dataKey="rounds"
                tickLine={false}
                axisLine={{ stroke: "var(--foreground)", strokeOpacity: 0.2 }}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                label={{
                  value: "Rounds",
                  position: "insideBottom",
                  offset: -10,
                  fill: "var(--muted-foreground)",
                  fontSize: 12,
                }}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              />
              <Tooltip
                content={RoundsTooltip}
                cursor={
                  view === "curve"
                    ? { stroke: "var(--foreground)", strokeOpacity: 0.2 }
                    : { fill: "var(--foreground)", fillOpacity: 0.05 }
                }
                isAnimationActive={false}
              />
              {view === "curve" ? (
                <Area
                  type="monotone"
                  dataKey="games"
                  stroke="var(--primary)"
                  strokeWidth={2}
                  fill="url(#rounds-fill)"
                  dot={{ r: 3, fill: "var(--primary)", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "var(--primary)", stroke: "var(--card)", strokeWidth: 2 }}
                />
              ) : (
                <Bar dataKey="games" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <table className="sr-only">
          <caption>Number of games by how many rounds they ran</caption>
          <thead>
            <tr>
              <th scope="col">Rounds</th>
              <th scope="col">Games</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((b) => (
              <tr key={b.rounds}>
                <td>{b.rounds}</td>
                <td>{b.games}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export function StatsTab({ data }: { data: Data }) {
  const buckets = useMemo(() => getRoundsDistribution(data), [data])

  if (buckets.length === 0) {
    return <p className="text-muted-foreground">No games with rounds recorded yet.</p>
  }

  return (
    <div className="grid gap-4">
      <RoundsPerGameCard buckets={buckets} />
    </div>
  )
}
