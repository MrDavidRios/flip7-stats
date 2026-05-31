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
})
