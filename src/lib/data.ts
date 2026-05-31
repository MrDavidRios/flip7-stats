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
  date: Date | null
}

export function parseDateFromName(name: string): Date | null {
  const match = name.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    return new Date(+match[1], +match[2] - 1, +match[3])
  }
  const match2 = name.match(/(\d{2})-(\d{2})-(\d{4})/)
  if (match2) {
    return new Date(+match2[3], +match2[1] - 1, +match2[2])
  }
  return null
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
        date: parseDateFromName(gameName),
      })
    }
  }

  return games
}
