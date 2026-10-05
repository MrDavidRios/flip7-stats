export interface TabData {
  headers: string[]
  rows: string[][]
  /** Free-text rows spaced out below the table. Absent in older data files. */
  notes?: string[]
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
  /** Games finished in 2nd place. */
  secondPlaces: number
  /** Games finished last (only counted in games with 2+ players). */
  lastPlaces: number
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
 * The player rows of a game tab, with trimmed names. Notes are split out of
 * the rows when the sheets are fetched, but older data files still carry them
 * ("Note: house rule ...") in the player column; those are skipped.
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
  const map = new Map<
    string,
    { gamesPlayed: number; totalScore: number; secondPlaces: number; lastPlaces: number }
  >()

  for (const spreadsheet of data.spreadsheets) {
    for (const tab of Object.values(spreadsheet.games)) {
      const ranked = playerRows(tab).sort((a, b) => b.score - a.score)
      ranked.forEach(({ name, score }, i) => {
        const existing =
          map.get(name) ?? { gamesPlayed: 0, totalScore: 0, secondPlaces: 0, lastPlaces: 0 }
        existing.gamesPlayed += 1
        existing.totalScore += score
        if (i === 1) existing.secondPlaces += 1
        if (ranked.length > 1 && i === ranked.length - 1) existing.lastPlaces += 1
        map.set(name, existing)
      })
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

export const PLAYER_BADGES = [
  { key: "lastPlaces", label: "Most last places" },
  { key: "secondPlaces", label: "Most 2nd places" },
] as const

export type PlayerBadge = (typeof PLAYER_BADGES)[number]

/** Badges each player holds; ties all get the badge, and a count of 0 earns nothing. */
export function getPlayerBadges(players: PlayerSummary[]): Map<string, PlayerBadge[]> {
  const badges = new Map<string, PlayerBadge[]>()
  for (const badge of PLAYER_BADGES) {
    const most = Math.max(0, ...players.map((p) => p[badge.key]))
    if (most === 0) continue
    for (const player of players) {
      if (player[badge.key] !== most) continue
      badges.set(player.name, [...(badges.get(player.name) ?? []), badge])
    }
  }
  return badges
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

/**
 * How many rounds a game ran: the last "Round N" column any player has a
 * value in. Sheets sometimes carry blank round columns past the end.
 */
export function roundCount(tab: TabData): number {
  const roundColumns = tab.headers
    .map((header, i) => (/^round\b/i.test(header.trim()) ? i : -1))
    .filter((i) => i >= 0)
  const rows = playerRows(tab).map((p) => p.row)

  let last = 0
  roundColumns.forEach((col, n) => {
    if (rows.some((row) => (row[col] ?? "").trim() !== "")) last = n + 1
  })
  return last
}

export interface RoundsBucket {
  rounds: number
  games: number
}

/** Games per round count, with empty buckets kept so the shape reads true. */
export function getRoundsDistribution(data: Data): RoundsBucket[] {
  const counts = new Map<number, number>()
  for (const spreadsheet of data.spreadsheets) {
    for (const tab of Object.values(spreadsheet.games)) {
      const rounds = roundCount(tab)
      if (rounds === 0) continue
      counts.set(rounds, (counts.get(rounds) ?? 0) + 1)
    }
  }
  if (counts.size === 0) return []

  const min = Math.min(...counts.keys())
  const max = Math.max(...counts.keys())
  return Array.from({ length: max - min + 1 }, (_, i) => ({
    rounds: min + i,
    games: counts.get(min + i) ?? 0,
  }))
}
