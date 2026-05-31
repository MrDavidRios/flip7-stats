import { describe, it, expect } from "vitest"
import { GameTable } from "./GameTable"
import type { TabData } from "@/lib/data"

describe("GameTable", () => {
  it("accepts game prop with headers and rows", () => {
    const game: TabData = {
      headers: ["Player", "Total", "Round 1"],
      rows: [["Alice", "10", "10"], ["Bob", "7", "7"]],
    }

    // Should not throw
    expect(() => <GameTable game={game} />).not.toThrow()
  })

  it("accepts game data with zero values", () => {
    const game: TabData = {
      headers: ["Player", "Total", "Round 1"],
      rows: [["Alice", "10", "0"], ["Bob", "0", "7"]],
    }

    expect(() => <GameTable game={game} />).not.toThrow()
  })

  it("accepts empty rows array", () => {
    const game: TabData = {
      headers: ["Player", "Total"],
      rows: [],
    }

    expect(() => <GameTable game={game} />).not.toThrow()
  })
})
