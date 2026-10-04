export interface TabData {
  headers: string[]
  rows: string[][]
}

export interface GameTab extends TabData {
  gid: number
}

export interface SpreadsheetData {
  id: string
  label: string
  games: Record<string, GameTab>
}

export interface Data {
  fetchedAt: string
  spreadsheets: SpreadsheetData[]
}

export interface PlayerSummary {
  name: string
  gamesPlayed: number
  totalScore: number
  avgScore: number
}

export interface GameSummary {
  spreadsheetId: string
  gid: number
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

/**
 * The player rows of a game tab, with trimmed names. Sheets sometimes carry
 * free-text notes ("Note: house rule ...") in the player column; those are
 * not players and are skipped.
 */
export function playerRows(tab: TabData): { name: string; score: number; row: string[] }[] {
  return tab.rows
    .map((row) => ({ name: (row[0] ?? "").trim(), score: Number(row[1] ?? "0") || 0, row }))
    .filter((p) => p.name && !/^note\b/i.test(p.name))
}

export function gamePath(spreadsheetId: string, gid: number): string {
  return `/games/${encodeURIComponent(spreadsheetId)}/${gid}`
}

export function getGameDetail(
  data: Data,
  spreadsheetId: string,
  gid: number
): GameDetail | null {
  const spreadsheet = data.spreadsheets.find((s) => s.id === spreadsheetId)
  if (!spreadsheet) return null

  const entry = Object.entries(spreadsheet.games).find(
    ([, tab]) => tab.gid === gid
  )
  if (!entry) return null
  const [gameName, tab] = entry

  const players = playerRows(tab)
    .map(({ name, score }) => ({ name, score }))
    .sort((a, b) => b.score - a.score)
    .map((p, i) => ({ ...p, place: i + 1 }))

  return {
    name: gameName,
    spreadsheetLabel: spreadsheet.label,
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
      for (const { name, score } of playerRows(tab)) {
        const existing = map.get(name) ?? { gamesPlayed: 0, totalScore: 0 }
        existing.gamesPlayed += 1
        existing.totalScore += score
        map.set(name, existing)
      }
    }
  }

  return Array.from(map.entries())
    .map(([name, stats]) => ({
      name,
      ...stats,
      avgScore: stats.gamesPlayed > 0 ? stats.totalScore / stats.gamesPlayed : 0,
    }))
    .sort((a, b) => b.totalScore - a.totalScore)
}

export interface PlayerGameDetail {
  spreadsheetId: string
  gid: number
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
      const scores = playerRows(tab).sort((a, b) => b.score - a.score)
      const playerRow = scores.find((s) => s.name === playerName)
      if (!playerRow) continue

      const playerScore = playerRow.score
      const place = scores.findIndex((s) => s.name === playerName) + 1

      details.push({
        spreadsheetId: spreadsheet.id,
        gid: tab.gid,
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
      const rows = playerRows(tab)
      if (rows.length === 0) continue

      const players = rows.map((r) => r.name)
      let winner = ""
      let winnerScore = -Infinity

      for (const { name, score } of rows) {
        if (score > winnerScore) {
          winnerScore = score
          winner = name
        }
      }

      games.push({
        spreadsheetId: spreadsheet.id,
        gid: tab.gid,
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
