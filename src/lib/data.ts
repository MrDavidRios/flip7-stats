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

export interface GameDetail {
  name: string
  spreadsheetLabel: string
  date: Date | null
  tab: TabData
  players: {
    name: string
    score: number
    place: number
  }[]
}

export function getGameDetail(
  data: Data,
  gameName: string,
  spreadsheetLabel: string
): GameDetail | null {
  const spreadsheet = data.spreadsheets.find(
    (s) => s.label === spreadsheetLabel
  )
  if (!spreadsheet) return null

  const tab = spreadsheet.games[gameName]
  if (!tab) return null

  const players = tab.rows
    .filter((r) => r[0])
    .map((r) => ({ name: r[0], score: Number(r[1] ?? "0") }))
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, place: i + 1 }))

  return {
    name: gameName,
    spreadsheetLabel,
    date: parseDateFromName(gameName),
    tab,
    players,
  }
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

export interface PlayerGameDetail {
  gameName: string
  spreadsheetLabel: string
  date: Date | null
  playerScore: number
  place: number
  playerCount: number
  won: boolean
}

export interface PlayerStats {
  gamesPlayed: number
  totalPoints: number
  avgPoints: number
  gamesWon: number
  winPct: number
}

export function getPlayerGameDetails(
  data: Data,
  playerName: string
): PlayerGameDetail[] {
  const details: PlayerGameDetail[] = []

  for (const spreadsheet of data.spreadsheets) {
    for (const [gameName, tab] of Object.entries(spreadsheet.games)) {
      const playerRow = tab.rows.find((r) => r[0] === playerName)
      if (!playerRow) continue

      const scores = tab.rows
        .filter((r) => r[0])
        .map((r) => ({ name: r[0], score: Number(r[1] ?? "0") }))
        .sort((a, b) => b.score - a.score)

      const playerScore = Number(playerRow[1] ?? "0")
      const place = scores.findIndex((s) => s.name === playerName) + 1

      details.push({
        gameName,
        spreadsheetLabel: spreadsheet.label,
        date: parseDateFromName(gameName),
        playerScore,
        place,
        playerCount: scores.length,
        won: place === 1,
      })
    }
  }

  return details.sort((a, b) => {
    if (a.date && b.date) return b.date.getTime() - a.date.getTime()
    if (a.date) return -1
    if (b.date) return 1
    return 0
  })
}

export function getPlayerStats(games: PlayerGameDetail[]): PlayerStats {
  const gamesPlayed = games.length
  const totalPoints = games.reduce((sum, g) => sum + g.playerScore, 0)
  const gamesWon = games.filter((g) => g.won).length

  return {
    gamesPlayed,
    totalPoints,
    avgPoints: gamesPlayed > 0 ? totalPoints / gamesPlayed : 0,
    gamesWon,
    winPct: gamesPlayed > 0 ? (gamesWon / gamesPlayed) * 100 : 0,
  }
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
