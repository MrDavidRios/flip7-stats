import { describe, it, expect } from "vitest"
import {
  gamePath,
  getAllPlayers,
  getGameDates,
  getGameDetail,
  getPlayerGameDetails,
  type Data,
} from "./data"

const sampleData: Data = {
  fetchedAt: "2026-05-17T00:00:00.000Z",
  spreadsheets: [
    {
      id: "sheet-david",
      label: "David's games",
      games: {
        "Game 1": {
          gid: 0,
          headers: ["Player", "Total", "Round 1"],
          rows: [["Alice", "10", "10"], ["Bob", "7", "7"]],
        },
        "Game 2": {
          gid: 555,
          headers: ["Player", "Total"],
          rows: [["Alice", "5"], ["Charlie", "12"]],
        },
      },
    },
    {
      id: "sheet-gabe",
      label: "Gabe's games",
      games: {
        "Game 1": {
          gid: 0,
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
      { name: "Bob", gamesPlayed: 2, totalScore: 10 },
      { name: "Diana", gamesPlayed: 1, totalScore: 9 },
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

  it("identifies each game by spreadsheet id and gid", () => {
    const games = getGameDates(sampleData)
    expect(games.map((g) => [g.spreadsheetId, g.gid])).toEqual([
      ["sheet-david", 0],
      ["sheet-david", 555],
      ["sheet-gabe", 0],
    ])
  })
})

describe("getGameDetail", () => {
  it("finds a game by spreadsheet id and gid", () => {
    const game = getGameDetail(sampleData, "sheet-david", 555)
    expect(game).toMatchObject({
      name: "Game 2",
      spreadsheetLabel: "David's games",
    })
  })

  it("distinguishes tabs with the same gid in different spreadsheets", () => {
    expect(getGameDetail(sampleData, "sheet-gabe", 0)?.players[0].name).toBe(
      "Diana"
    )
    expect(getGameDetail(sampleData, "sheet-david", 0)?.players[0].name).toBe(
      "Alice"
    )
  })

  it("returns null for an unknown spreadsheet or gid", () => {
    expect(getGameDetail(sampleData, "nope", 0)).toBeNull()
    expect(getGameDetail(sampleData, "sheet-david", 999)).toBeNull()
    expect(getGameDetail(sampleData, "sheet-david", NaN)).toBeNull()
  })
})

describe("getPlayerGameDetails", () => {
  it("includes the spreadsheet id and gid needed to link to each game", () => {
    const games = getPlayerGameDetails(sampleData, "Bob")
    expect(games.map((g) => [g.spreadsheetId, g.gid])).toEqual([
      ["sheet-david", 0],
      ["sheet-gabe", 0],
    ])
  })
})

describe("gamePath", () => {
  it("builds the game route from spreadsheet id and gid", () => {
    expect(gamePath("sheet-david", 555)).toBe("/games/sheet-david/555")
  })
})
