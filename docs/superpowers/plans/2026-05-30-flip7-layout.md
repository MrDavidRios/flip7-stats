# Flip7 Score Tracker Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current raw-table UI with a tabbed layout (Calendar + Players), a calendar view showing game dates, and a styled recent-games table — all using shadcn wrapper components.

**Architecture:** Two-tab layout using shadcn `Tabs`. The Calendar tab shows a month calendar (shadcn `Calendar`) with game dates highlighted, plus a recent-games table (shadcn `Table`). The Players tab shows a card grid of all players with aggregate stats. Data transformation logic is extracted into a `src/lib/data.ts` module so components stay thin. All shadcn primitives live in `src/components/ui/`; app code imports only from `src/components/` wrappers.

**Tech Stack:** React 19, Tailwind CSS v4, shadcn/ui (base-nova style), Vite, TypeScript 6

---

## File Structure

```
src/
├── lib/
│   ├── utils.ts              (exists — cn utility)
│   ├── data.ts               (CREATE — types + data transform helpers)
│   └── data.test.ts           (CREATE — tests for data transforms)
├── components/
│   ├── ui/                    (shadcn primitives — never import directly)
│   │   ├── button.tsx         (exists)
│   │   ├── tabs.tsx           (ADD via shadcn CLI)
│   │   ├── calendar.tsx       (ADD via shadcn CLI)
│   │   ├── table.tsx          (ADD via shadcn CLI)
│   │   └── card.tsx           (ADD via shadcn CLI)
│   ├── Button.tsx             (exists — wrapper)
│   ├── Tabs.tsx               (CREATE — wrapper for tabs)
│   ├── Calendar.tsx           (CREATE — wrapper for calendar)
│   ├── Table.tsx              (CREATE — wrapper for table)
│   ├── Card.tsx               (CREATE — wrapper for card)
│   ├── AppHeader.tsx          (CREATE — top header bar)
│   ├── CalendarTab.tsx        (CREATE — calendar + recent games)
│   ├── PlayersTab.tsx         (CREATE — player list/cards)
│   └── GameTable.tsx          (CREATE — single game score table)
├── App.tsx                    (MODIFY — replace with tabbed layout)
├── App.css                    (MODIFY — remove old styles, keep minimal)
├── index.css                  (exists — shadcn theme vars, keep as-is)
└── main.tsx                   (exists — no changes)
```

---

### Task 1: Install shadcn components

**Files:**
- Modify: `src/components/ui/` (new files added by CLI)

- [ ] **Step 1: Add shadcn components via CLI**

```bash
npx shadcn@latest add tabs calendar table card --yes
```

If the CLI writes files to `@/` instead of `src/`, move them:
```bash
mv @/components/ui/* src/components/ui/
mv @/lib/* src/lib/
rm -rf @/
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ src/lib/ package.json package-lock.json
git commit -m "chore: add shadcn tabs, calendar, table, card components"
```

---

### Task 2: Create wrapper components

**Files:**
- Create: `src/components/Tabs.tsx`
- Create: `src/components/Calendar.tsx`
- Create: `src/components/Table.tsx`
- Create: `src/components/Card.tsx`

- [ ] **Step 1: Create Tabs wrapper**

```tsx
// src/components/Tabs.tsx
import {
  Tabs as ShadcnTabs,
  TabsContent as ShadcnTabsContent,
  TabsList as ShadcnTabsList,
  TabsTrigger as ShadcnTabsTrigger,
} from "@/components/ui/tabs"
import type { ComponentProps } from "react"

export function Tabs(props: ComponentProps<typeof ShadcnTabs>) {
  return <ShadcnTabs {...props} />
}

export function TabsList(props: ComponentProps<typeof ShadcnTabsList>) {
  return <ShadcnTabsList {...props} />
}

export function TabsTrigger(props: ComponentProps<typeof ShadcnTabsTrigger>) {
  return <ShadcnTabsTrigger {...props} />
}

export function TabsContent(props: ComponentProps<typeof ShadcnTabsContent>) {
  return <ShadcnTabsContent {...props} />
}
```

- [ ] **Step 2: Create Calendar wrapper**

```tsx
// src/components/Calendar.tsx
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar"
import type { ComponentProps } from "react"

export function Calendar(props: ComponentProps<typeof ShadcnCalendar>) {
  return <ShadcnCalendar {...props} />
}
```

- [ ] **Step 3: Create Table wrapper**

```tsx
// src/components/Table.tsx
import {
  Table as ShadcnTable,
  TableBody as ShadcnTableBody,
  TableCell as ShadcnTableCell,
  TableHead as ShadcnTableHead,
  TableHeader as ShadcnTableHeader,
  TableRow as ShadcnTableRow,
} from "@/components/ui/table"
import type { ComponentProps } from "react"

export function Table(props: ComponentProps<typeof ShadcnTable>) {
  return <ShadcnTable {...props} />
}

export function TableBody(props: ComponentProps<typeof ShadcnTableBody>) {
  return <ShadcnTableBody {...props} />
}

export function TableCell(props: ComponentProps<typeof ShadcnTableCell>) {
  return <ShadcnTableCell {...props} />
}

export function TableHead(props: ComponentProps<typeof ShadcnTableHead>) {
  return <ShadcnTableHead {...props} />
}

export function TableHeader(props: ComponentProps<typeof ShadcnTableHeader>) {
  return <ShadcnTableHeader {...props} />
}

export function TableRow(props: ComponentProps<typeof ShadcnTableRow>) {
  return <ShadcnTableRow {...props} />
}
```

- [ ] **Step 4: Create Card wrapper**

```tsx
// src/components/Card.tsx
import {
  Card as ShadcnCard,
  CardContent as ShadcnCardContent,
  CardDescription as ShadcnCardDescription,
  CardHeader as ShadcnCardHeader,
  CardTitle as ShadcnCardTitle,
} from "@/components/ui/card"
import type { ComponentProps } from "react"

export function Card(props: ComponentProps<typeof ShadcnCard>) {
  return <ShadcnCard {...props} />
}

export function CardContent(props: ComponentProps<typeof ShadcnCardContent>) {
  return <ShadcnCardContent {...props} />
}

export function CardDescription(props: ComponentProps<typeof ShadcnCardDescription>) {
  return <ShadcnCardDescription {...props} />
}

export function CardHeader(props: ComponentProps<typeof ShadcnCardHeader>) {
  return <ShadcnCardHeader {...props} />
}

export function CardTitle(props: ComponentProps<typeof ShadcnCardTitle>) {
  return <ShadcnCardTitle {...props} />
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/Tabs.tsx src/components/Calendar.tsx src/components/Table.tsx src/components/Card.tsx
git commit -m "feat: add wrapper components for tabs, calendar, table, card"
```

---

### Task 3: Extract data types and transformation helpers

**Files:**
- Create: `src/lib/data.ts`
- Create: `src/lib/data.test.ts`

The raw `data.json` has this shape:
```json
{
  "fetchedAt": "2026-05-17T00:00:00.000Z",
  "spreadsheets": [
    {
      "label": "David's games",
      "games": {
        "Game 1": { "headers": ["Player", "Score"], "rows": [["Alice", "10"], ["Bob", "7"]] }
      }
    }
  ]
}
```

Each spreadsheet label is a group (e.g., "David's games"). Each game key is a game name. Rows have player name in column 0, total score in column 1, and optional per-round scores in remaining columns.

- [ ] **Step 1: Write failing tests for data transforms**

```ts
// src/lib/data.test.ts
import { describe, it, expect } from "vitest"
import { getAllPlayers, getGameDates, type Data } from "./data"

const sampleData: Data = {
  fetchedAt: "2026-05-17T00:00:00.000Z",
  spreadsheets: [
    {
      label: "David's games",
      games: {
        "Game 1": {
          headers: ["Player", "Total", "Round 1"],
          rows: [["Alice", "10", "10"], ["Bob", "7", "7"]],
        },
        "Game 2": {
          headers: ["Player", "Total"],
          rows: [["Alice", "5"], ["Charlie", "12"]],
        },
      },
    },
    {
      label: "Gabe's games",
      games: {
        "Game 1": {
          headers: ["Player", "Total"],
          rows: [["Bob", "3"], ["Diana", "9"]],
        },
      },
    },
  ],
}

describe("getAllPlayers", () => {
  it("returns unique players across all spreadsheets with game counts and total scores", () => {
    const players = getAllPlayers(sampleData)
    expect(players).toEqual([
      { name: "Alice", gamesPlayed: 2, totalScore: 15 },
      { name: "Charlie", gamesPlayed: 1, totalScore: 12 },
      { name: "Diana", gamesPlayed: 1, totalScore: 9 },
      { name: "Bob", gamesPlayed: 2, totalScore: 10 },
    ])
  })
})

describe("getGameDates", () => {
  it("returns game names as-is (no date parsing for now)", () => {
    const games = getGameDates(sampleData)
    expect(games).toHaveLength(3)
    expect(games[0]).toMatchObject({
      name: "Game 1",
      spreadsheetLabel: "David's games",
      playerCount: 2,
    })
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/data.test.ts`
Expected: FAIL — modules not found.

- [ ] **Step 3: Implement data.ts**

```ts
// src/lib/data.ts

export interface TabData {
  headers: string[]
  rows: string[][]
}

export interface SpreadsheetData {
  label: string
  games: Record<string, TabData>
}

export interface Data {
  fetchedAt: string
  spreadsheets: SpreadsheetData[]
}

export interface PlayerSummary {
  name: string
  gamesPlayed: number
  totalScore: number
}

export interface GameSummary {
  name: string
  spreadsheetLabel: string
  playerCount: number
  players: string[]
  winner: string
  winnerScore: number
}

export function getAllPlayers(data: Data): PlayerSummary[] {
  const map = new Map<string, { gamesPlayed: number; totalScore: number }>()

  for (const spreadsheet of data.spreadsheets) {
    for (const tab of Object.values(spreadsheet.games)) {
      for (const row of tab.rows) {
        const name = row[0] ?? ""
        const score = Number(row[1] ?? "0")
        if (!name) continue
        const existing = map.get(name) ?? { gamesPlayed: 0, totalScore: 0 }
        existing.gamesPlayed += 1
        existing.totalScore += score
        map.set(name, existing)
      }
    }
  }

  return Array.from(map.entries())
    .map(([name, stats]) => ({ name, ...stats }))
    .sort((a, b) => b.totalScore - a.totalScore)
}

export function getGameDates(data: Data): GameSummary[] {
  const games: GameSummary[] = []

  for (const spreadsheet of data.spreadsheets) {
    for (const [gameName, tab] of Object.entries(spreadsheet.games)) {
      if (tab.rows.length === 0) continue

      const players = tab.rows.map((r) => r[0] ?? "").filter(Boolean)
      let winner = ""
      let winnerScore = -Infinity

      for (const row of tab.rows) {
        const score = Number(row[1] ?? "0")
        if (score > winnerScore) {
          winnerScore = score
          winner = row[0] ?? ""
        }
      }

      games.push({
        name: gameName,
        spreadsheetLabel: spreadsheet.label,
        playerCount: players.length,
        players,
        winner,
        winnerScore,
      })
    }
  }

  return games
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/data.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/data.ts src/lib/data.test.ts
git commit -m "feat: add data transformation helpers with tests"
```

---

### Task 4: Build AppHeader component

**Files:**
- Create: `src/components/AppHeader.tsx`

- [ ] **Step 1: Create AppHeader**

```tsx
// src/components/AppHeader.tsx
interface AppHeaderProps {
  fetchedAt: string
}

export function AppHeader({ fetchedAt }: AppHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-foreground">
        Flip 7 Stats
      </h1>
      <p className="text-sm text-muted-foreground">
        Last updated: {new Date(fetchedAt).toLocaleString()}
      </p>
    </header>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppHeader.tsx
git commit -m "feat: add AppHeader component"
```

---

### Task 5: Build GameTable component

**Files:**
- Create: `src/components/GameTable.tsx`

This replaces the inline `<table>` markup in App.tsx with a shadcn Table wrapper.

- [ ] **Step 1: Create GameTable**

```tsx
// src/components/GameTable.tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/GameTable.tsx
git commit -m "feat: add GameTable component using shadcn Table wrapper"
```

---

### Task 6: Build CalendarTab component

**Files:**
- Create: `src/components/CalendarTab.tsx`

The Calendar tab has two sections: a shadcn Calendar (month view) and a "Recent Games" summary table below it. Since game names in the data aren't dates, the calendar is initially decorative — showing today's date. As the data evolves to include real dates, the calendar can highlight game days.

- [ ] **Step 1: Create CalendarTab**

```tsx
// src/components/CalendarTab.tsx
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
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/CalendarTab.tsx
git commit -m "feat: add CalendarTab with calendar and recent games table"
```

---

### Task 7: Build PlayersTab component

**Files:**
- Create: `src/components/PlayersTab.tsx`

Displays a responsive grid of player cards, each showing name, games played, and total score.

- [ ] **Step 1: Create PlayersTab**

```tsx
// src/components/PlayersTab.tsx
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
              <dt className="text-muted-foreground">Total score</dt>
              <dd className="text-right font-medium">{player.totalScore}</dd>
            </dl>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 3: Commit**

```bash
git add src/components/PlayersTab.tsx
git commit -m "feat: add PlayersTab component with player cards"
```

---

### Task 8: Rewrite App.tsx with tabbed layout

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.css` (gut old styles)

- [ ] **Step 1: Replace App.css with minimal styles**

```css
/* src/App.css */
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 24px;
}
```

- [ ] **Step 2: Rewrite App.tsx**

```tsx
// src/App.tsx
import { useEffect, useState } from "react"
import "./App.css"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/Tabs"
import { AppHeader } from "@/components/AppHeader"
import { CalendarTab } from "@/components/CalendarTab"
import { PlayersTab } from "@/components/PlayersTab"
import { getAllPlayers, getGameDates, type Data } from "@/lib/data"

function App() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load data (${r.status})`)
        return r.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
  }, [])

  if (error) {
    return (
      <div className="container">
        <AppHeader fetchedAt="" />
        <p className="text-destructive">Could not load data: {error}</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="container">
        <AppHeader fetchedAt="" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  const players = getAllPlayers(data)
  const games = getGameDates(data)

  return (
    <div className="container">
      <AppHeader fetchedAt={data.fetchedAt} />

      <Tabs defaultValue="calendar">
        <TabsList>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <CalendarTab games={games} />
        </TabsContent>
        <TabsContent value="players">
          <PlayersTab players={players} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default App
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: Clean build.

- [ ] **Step 4: Run all tests**

Run: `npm test`
Expected: All tests pass.

- [ ] **Step 5: Start dev server and visually verify**

Run: `npm run dev`

Check:
- Header shows "Flip 7 Stats" + last updated timestamp
- Two tabs: "Calendar" and "Players"
- Calendar tab shows month calendar and "Recent Games" table with game name, source, winner, score, player count
- Players tab shows card grid with player name, games played, total score
- Dark mode works (toggle OS setting)
- Responsive — cards stack on mobile

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.css
git commit -m "feat: rewrite App with tabbed Calendar/Players layout"
```

---

## Notes

- **Calendar dates:** The current `data.json` uses game names like "Game 1", not dates. The calendar is present for the layout but doesn't highlight specific dates yet. When game data includes date info, `CalendarTab` can be updated to highlight those days and filter games on click.
- **GameTable component:** Built in Task 5 but not wired into the layout yet. It's ready for a future "game detail" view where clicking a game row in the recent-games table expands to show the full score breakdown per round.
- **No routing:** This plan uses shadcn Tabs (client-side tab switching), not a router. If the app grows to need deep-linking, a router can be added later.
