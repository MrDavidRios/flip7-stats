import { describe, it, expect, vi } from "vitest";
import {
  fetchAllSheets,
  parseTabData,
  type SheetsClient,
  type Config,
} from "./fetch-sheets";

function mockSheetsClient(tabs: Record<string, unknown[][]>): SheetsClient {
  return {
    spreadsheets: {
      get: vi.fn().mockResolvedValue({
        data: {
          sheets: Object.keys(tabs).map((title) => ({
            properties: { title },
          })),
        },
      }),
      values: {
        get: vi.fn().mockImplementation(({ range }: { range: string }) => {
          const tabName = range.replace(/^'|'$/g, "");
          return Promise.resolve({
            data: { values: tabs[tabName] ?? [] },
          });
        }),
      },
    },
  };
}

describe("parseTabData", () => {
  it("handles simple format: headers in row 1, data in row 2+", () => {
    const result = parseTabData([
      ["Name", "Total", "", ""],
      ["Diego", "209", "0", "0"],
      ["Olivia", "175", "23", "29"],
    ]);

    expect(result.headers).toEqual(["Name", "Total", "", ""]);
    expect(result.rows).toEqual([
      ["Diego", "209", "0", "0"],
      ["Olivia", "175", "23", "29"],
    ]);
  });

  it("handles merged header row: skips it and uses row 2 as headers", () => {
    const result = parseTabData([
      ["", "", "Round", "", "", ""],
      ["Player", "Total", "1", "2", "3", "4"],
      ["Abby", "178", "35", "24", "34", ""],
      ["Gabe", "98", "35", "32", "11", "20"],
    ]);

    expect(result.headers).toEqual(["Player", "Total", "1", "2", "3", "4"]);
    expect(result.rows).toEqual([
      ["Abby", "178", "35", "24", "34", ""],
      ["Gabe", "98", "35", "32", "11", "20"],
    ]);
  });

  it("returns empty for empty input", () => {
    expect(parseTabData([])).toEqual({ headers: [], rows: [] });
  });

  it("handles data starting at row 1 (no header row above)", () => {
    const result = parseTabData([
      ["Alice", "50", "10", "20", "20"],
      ["Bob", "30", "15", "15", ""],
    ]);

    expect(result.headers).toEqual(["Alice", "50", "10", "20", "20"]);
    expect(result.rows).toEqual([
      ["Alice", "50", "10", "20", "20"],
      ["Bob", "30", "15", "15", ""],
    ]);
  });

  it("handles empty cells as empty strings", () => {
    const result = parseTabData([
      ["Name", "Total"],
      ["John", "37", null, undefined],
    ]);

    expect(result.rows[0]).toEqual(["John", "37", "", ""]);
  });

  it("handles headers-only with no data rows", () => {
    const result = parseTabData([["Player", "Score"]]);

    expect(result.headers).toEqual(["Player", "Score"]);
    expect(result.rows).toEqual([]);
  });

  it("skips multiple non-data rows above the header", () => {
    const result = parseTabData([
      ["", "", "Some Title"],
      ["", "", "Round"],
      ["Player", "Total", "1", "2"],
      ["Alice", "100", "50", "50"],
    ]);

    expect(result.headers).toEqual(["Player", "Total", "1", "2"]);
    expect(result.rows).toEqual([["Alice", "100", "50", "50"]]);
  });
});

describe("fetchAllSheets", () => {
  it("fetches all tabs and parses them", async () => {
    const client = mockSheetsClient({
      "Game 1": [
        ["Player", "Score"],
        ["Alice", "10"],
        ["Bob", "7"],
      ],
      "Game 2": [
        ["Player", "Score"],
        ["Charlie", "5"],
      ],
    });

    const config: Config = {
      sheets: [{ id: "sheet-123", label: "Test Sheet" }],
    };

    const results = await fetchAllSheets(client, config);

    expect(results).toHaveLength(1);
    expect(Object.keys(results[0].games)).toEqual(["Game 1", "Game 2"]);
    expect(results[0].games["Game 1"].rows).toEqual([
      ["Alice", "10"],
      ["Bob", "7"],
    ]);
  });

  it("handles empty tabs", async () => {
    const client = mockSheetsClient({ "Empty Tab": [] });
    const config: Config = {
      sheets: [{ id: "sheet-123", label: "Test" }],
    };

    const results = await fetchAllSheets(client, config);
    expect(results[0].games["Empty Tab"]).toEqual({ headers: [], rows: [] });
  });

  it("handles a spreadsheet with no tabs", async () => {
    const client: SheetsClient = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({ data: { sheets: [] } }),
        values: { get: vi.fn() },
      },
    };

    const config: Config = {
      sheets: [{ id: "sheet-123", label: "Empty" }],
    };

    const results = await fetchAllSheets(client, config);
    expect(results[0].games).toEqual({});
  });

  it("fetches multiple spreadsheets", async () => {
    const client: SheetsClient = {
      spreadsheets: {
        get: vi
          .fn()
          .mockImplementation(
            ({ spreadsheetId }: { spreadsheetId: string }) => {
              const tabs =
                spreadsheetId === "sheet-a"
                  ? [{ properties: { title: "Round 1" } }]
                  : [{ properties: { title: "Round 2" } }];
              return Promise.resolve({ data: { sheets: tabs } });
            }
          ),
        values: {
          get: vi
            .fn()
            .mockImplementation(
              ({ spreadsheetId }: { spreadsheetId: string }) => {
                const values =
                  spreadsheetId === "sheet-a"
                    ? [["Player", "Score"], ["Alice", "3"]]
                    : [["Player", "Score"], ["Bob", "8"]];
                return Promise.resolve({ data: { values } });
              }
            ),
        },
      },
    };

    const config: Config = {
      sheets: [
        { id: "sheet-a", label: "Player A" },
        { id: "sheet-b", label: "Player B" },
      ],
    };

    const results = await fetchAllSheets(client, config);
    expect(results).toHaveLength(2);
    expect(results[0].games["Round 1"].rows).toEqual([["Alice", "3"]]);
    expect(results[1].games["Round 2"].rows).toEqual([["Bob", "8"]]);
  });

  it("quotes tab names in the range parameter", async () => {
    const valuesGet = vi
      .fn()
      .mockResolvedValue({ data: { values: [["Name", "Total"], ["A", "1"]] } });

    const client: SheetsClient = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({
          data: { sheets: [{ properties: { title: "Tab With Spaces" } }] },
        }),
        values: { get: valuesGet },
      },
    };

    const config: Config = {
      sheets: [{ id: "sheet-123", label: "Test" }],
    };

    await fetchAllSheets(client, config);

    expect(valuesGet).toHaveBeenCalledWith({
      spreadsheetId: "sheet-123",
      range: "'Tab With Spaces'",
    });
  });

  it("skips tabs with null or undefined titles", async () => {
    const client: SheetsClient = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({
          data: {
            sheets: [
              { properties: { title: "Valid" } },
              { properties: { title: null } },
              { properties: {} },
              {},
            ],
          },
        }),
        values: {
          get: vi.fn().mockResolvedValue({
            data: { values: [["Name", "Total"], ["X", "1"]] },
          }),
        },
      },
    };

    const config: Config = {
      sheets: [{ id: "sheet-123", label: "Test" }],
    };

    const results = await fetchAllSheets(client, config);
    expect(Object.keys(results[0].games)).toEqual(["Valid"]);
  });
});
