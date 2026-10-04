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
          sheets: Object.keys(tabs).map((title, i) => ({
            properties: { title, sheetId: 100 + i },
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
  it("generates standardized headers from simple format", () => {
    const result = parseTabData([
      ["Name", "Total", "", ""],
      ["Diego", "209", "0", "0"],
      ["Olivia", "175", "23", "29"],
    ]);

    expect(result.headers).toEqual(["Player", "Total", "Round 1", "Round 2"]);
    expect(result.rows).toEqual([
      ["Diego", "209", "0", "0"],
      ["Olivia", "175", "23", "29"],
    ]);
  });

  it("generates standardized headers from merged header format", () => {
    const result = parseTabData([
      ["", "", "Round", "", "", ""],
      ["Player", "Total", "1", "2", "3", "4"],
      ["Abby", "178", "35", "24", "34", ""],
      ["Gabe", "98", "35", "32", "11", "20"],
    ]);

    expect(result.headers).toEqual([
      "Player", "Total", "Round 1", "Round 2", "Round 3", "Round 4",
    ]);
    expect(result.rows).toEqual([
      ["Abby", "178", "35", "24", "34", ""],
      ["Gabe", "98", "35", "32", "11", "20"],
    ]);
  });

  it("returns empty for empty input", () => {
    expect(parseTabData([])).toEqual({ headers: [], rows: [], notes: [] });
  });

  it("handles data starting at row 1 (no header row above)", () => {
    const result = parseTabData([
      ["Alice", "50", "10", "20", "20"],
      ["Bob", "30", "15", "15", ""],
    ]);

    expect(result.headers).toEqual([
      "Player", "Total", "Round 1", "Round 2", "Round 3",
    ]);
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

  it("determines column count from the widest data row", () => {
    const result = parseTabData([
      ["Name", "Total"],
      ["Alice", "10", "5"],
      ["Bob", "20", "8", "12"],
    ]);

    expect(result.headers).toEqual([
      "Player", "Total", "Round 1", "Round 2",
    ]);
  });

  it("skips multiple non-data rows above the header", () => {
    const result = parseTabData([
      ["", "", "Some Title"],
      ["", "", "Round"],
      ["Player", "Total", "1", "2"],
      ["Alice", "100", "50", "50"],
    ]);

    expect(result.headers).toEqual(["Player", "Total", "Round 1", "Round 2"]);
    expect(result.rows).toEqual([["Alice", "100", "50", "50"]]);
  });

  it("handles a sheet with only two columns (player + total)", () => {
    const result = parseTabData([
      ["Name", "Score"],
      ["Alice", "50"],
    ]);

    expect(result.headers).toEqual(["Player", "Total"]);
    expect(result.rows).toEqual([["Alice", "50"]]);
  });

  it("treats rows spaced out below the table as notes", () => {
    const result = parseTabData([
      ["", "", "Round"],
      ["Player", "Total", "1", "2"],
      ["Abel", "54", "32", "22"],
      ["Jered", "47", "26", "21"],
      [],
      ["Note: house rule - x2 for 7 numeric cards"],
      ["", ""],
      ["", "second note", "", "continued"],
    ]);

    expect(result.headers).toEqual(["Player", "Total", "Round 1", "Round 2"]);
    expect(result.rows).toEqual([
      ["Abel", "54", "32", "22"],
      ["Jered", "47", "26", "21"],
    ]);
    expect(result.notes).toEqual([
      "Note: house rule - x2 for 7 numeric cards",
      "second note continued",
    ]);
  });

  it("returns no notes when the table has none", () => {
    const result = parseTabData([
      ["Player", "Total"],
      ["Alice", "50"],
      [],
    ]);

    expect(result.rows).toEqual([["Alice", "50"]]);
    expect(result.notes).toEqual([]);
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

  it("records the spreadsheet id and each tab's gid", async () => {
    const client = mockSheetsClient({
      "Game 1": [["Player", "Score"], ["Alice", "10"]],
      "Game 2": [["Player", "Score"], ["Bob", "7"]],
    });
    const config: Config = {
      sheets: [{ id: "sheet-123", label: "Test Sheet" }],
    };

    const results = await fetchAllSheets(client, config);

    expect(client.spreadsheets.get).toHaveBeenCalledWith({
      spreadsheetId: "sheet-123",
      fields: "sheets.properties(title,sheetId)",
    });
    expect(results[0].id).toBe("sheet-123");
    expect(results[0].games["Game 1"].gid).toBe(100);
    expect(results[0].games["Game 2"].gid).toBe(101);
  });

  it("handles empty tabs", async () => {
    const client = mockSheetsClient({ "Empty Tab": [] });
    const config: Config = {
      sheets: [{ id: "sheet-123", label: "Test" }],
    };

    const results = await fetchAllSheets(client, config);
    expect(results[0].games["Empty Tab"]).toEqual({
      gid: 100,
      headers: [],
      rows: [],
      notes: [],
    });
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
                  ? [{ properties: { title: "Round 1", sheetId: 0 } }]
                  : [{ properties: { title: "Round 2", sheetId: 0 } }];
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
      .mockResolvedValue({
        data: { values: [["Name", "Total"], ["A", "1"]] },
      });

    const client: SheetsClient = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({
          data: {
            sheets: [{ properties: { title: "Tab With Spaces", sheetId: 0 } }],
          },
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
              { properties: { title: "Valid", sheetId: 1 } },
              { properties: { title: null, sheetId: 2 } },
              { properties: { sheetId: 3 } },
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

  it("skips tabs with no sheetId", async () => {
    const client: SheetsClient = {
      spreadsheets: {
        get: vi.fn().mockResolvedValue({
          data: {
            sheets: [
              { properties: { title: "Valid", sheetId: 0 } },
              { properties: { title: "No Id", sheetId: null } },
              { properties: { title: "Missing Id" } },
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
