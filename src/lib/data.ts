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
