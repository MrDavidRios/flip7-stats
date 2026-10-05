import { describe, it, expect } from "vitest"
import {
  gamePath,
  getAllPlayers,
  getGameDates,
  getGameDetail,
  getPlayerBadges,
  getPlayerGameDetails,
  getRoundsDistribution,
  playerRows,
  roundCount,
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
      { name: "Alice", gamesPlayed: 2, totalScore: 15, avgScore: 7.5, secondPlaces: 1, lastPlaces: 1 },
      { name: "Charlie", gamesPlayed: 1, totalScore: 12, avgScore: 12, secondPlaces: 0, lastPlaces: 0 },
      { name: "Bob", gamesPlayed: 2, totalScore: 10, avgScore: 5, secondPlaces: 2, lastPlaces: 2 },
      { name: "Diana", gamesPlayed: 1, totalScore: 9, avgScore: 9, secondPlaces: 0, lastPlaces: 0 },
    ])
  })

  it("counts 2nd and last places separately in games with 3+ players", () => {
    const players = getAllPlayers({
      fetchedAt: "",
      spreadsheets: [
        {
          id: "s",
          label: "s",
          games: {
            "Game 1": { gid: 0, headers: ["Player", "Total"], rows: [["A", "30"], ["B", "20"], ["C", "10"]] },
            "Solo": { gid: 1, headers: ["Player", "Total"], rows: [["C", "5"]] },
          },
        },
      ],
    })
    const byName = Object.fromEntries(players.map((p) => [p.name, p]))
    expect(byName.B).toMatchObject({ secondPlaces: 1, lastPlaces: 0 })
    expect(byName.C).toMatchObject({ secondPlaces: 0, lastPlaces: 1 })
  })
})

describe("getPlayerBadges", () => {
  const player = (name: string, secondPlaces: number, lastPlaces: number) => ({
    name,
    gamesPlayed: 1,
    totalScore: 0,
    avgScore: 0,
    secondPlaces,
    lastPlaces,
  })

  it("gives each badge to every player tied for the most", () => {
    const badges = getPlayerBadges([player("A", 3, 1), player("B", 3, 4), player("C", 0, 2)])
    expect(badges.get("A")?.map((b) => b.label)).toEqual(["Most 2nd places"])
    expect(badges.get("B")?.map((b) => b.label)).toEqual(["Most last places", "Most 2nd places"])
    expect(badges.has("C")).toBe(false)
  })

  it("awards nothing when no one has the stat", () => {
    expect(getPlayerBadges([player("A", 0, 0)]).size).toBe(0)
  })
})

describe("playerRows", () => {
  it("trims names and skips note rows in the player column", () => {
    const rows = playerRows({
      headers: ["Player", "Total"],
      rows: [["John ", "37"], ["Note: house rule - x2", "0"], ["", ""], ["Ann", ""]],
    })
    expect(rows.map((r) => [r.name, r.score])).toEqual([["John", 37], ["Ann", 0]])
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

describe("roundCount", () => {
  it("counts up to the last round anyone scored in, ignoring blank trailing columns", () => {
    expect(
      roundCount({
        headers: ["Player", "Total", "Round 1", "Round 2", "Round 3", "Round 4"],
        rows: [
          ["Alice", "10", "0", "", "10", ""],
          ["Bob", "7", "7", "", ""],
        ],
      })
    ).toBe(3)
  })

  it("skips note rows and tabs without rounds", () => {
    expect(
      roundCount({
        headers: ["Player", "Total", "Round 1", "Round 2"],
        rows: [["Alice", "5", "5", ""], ["Note: x", "", "", "y"]],
      })
    ).toBe(1)
    expect(roundCount({ headers: ["Player", "Total"], rows: [["Alice", "5"]] })).toBe(0)
  })
})

describe("getRoundsDistribution", () => {
  it("buckets games by round count, filling gaps between min and max", () => {
    const tab = (rounds: number) => ({
      gid: rounds,
      headers: ["Player", "Total", ...Array.from({ length: rounds }, (_, i) => `Round ${i + 1}`)],
      rows: [["Alice", "1", ...Array(rounds).fill("1")]],
    })
    const data: Data = {
      fetchedAt: "",
      spreadsheets: [
        { id: "s", label: "S", games: { a: tab(3), b: tab(5), c: tab(5), d: { gid: 9, headers: [], rows: [] } } },
      ],
    }
    expect(getRoundsDistribution(data)).toEqual([
      { rounds: 3, games: 1 },
      { rounds: 4, games: 0 },
      { rounds: 5, games: 2 },
    ])
  })
})
