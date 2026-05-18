import { describe, it, expect, vi } from "vitest";
import {
  fetchAllSheets,
  type SheetsClient,
  type Config,
} from "./fetch-sheets";

function mockSheetsClient(
  tabs: Record<string, unknown[][]>
): SheetsClient {
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

describe("fetchAllSheets", () => {
  it("fetches all tabs and splits headers from rows", async () => {
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
    expect(results[0].label).toBe("Test Sheet");
    expect(Object.keys(results[0].games)).toEqual(["Game 1", "Game 2"]);

    expect(results[0].games["Game 1"]).toEqual({
      headers: ["Player", "Score"],
      rows: [["Alice", "10"], ["Bob", "7"]],
    });
    expect(results[0].games["Game 2"]).toEqual({
      headers: ["Player", "Score"],
      rows: [["Charlie", "5"]],
    });
  });

  it("handles empty tabs", async () => {
    const client = mockSheetsClient({
      "Empty Tab": [],
    });

    const config: Config = {
      sheets: [{ id: "sheet-123", label: "Test" }],
    };

    const results = await fetchAllSheets(client, config);

    expect(results[0].games["Empty Tab"]).toEqual({
      headers: [],
      rows: [],
    });
  });

  it("handles a tab with only headers and no data rows", async () => {
    const client = mockSheetsClient({
      "Headers Only": [["Player", "Score"]],
    });

    const config: Config = {
      sheets: [{ id: "sheet-123", label: "Test" }],
    };

    const results = await fetchAllSheets(client, config);

    expect(results[0].games["Headers Only"]).toEqual({
      headers: ["Player", "Score"],
      rows: [],
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
      sheets: [{ id: "sheet-123", label: "Empty Spreadsheet" }],
    };

    const results = await fetchAllSheets(client, config);

    expect(results).toHaveLength(1);
    expect(results[0].games).toEqual({});
  });

  it("fetches multiple spreadsheets", async () => {
    const client: SheetsClient = {
      spreadsheets: {
        get: vi.fn().mockImplementation(({ spreadsheetId }: { spreadsheetId: string }) => {
          const tabs =
            spreadsheetId === "sheet-a"
              ? [{ properties: { title: "Round 1" } }]
              : [{ properties: { title: "Round 2" } }];
          return Promise.resolve({ data: { sheets: tabs } });
        }),
        values: {
          get: vi.fn().mockImplementation(({ spreadsheetId }: { spreadsheetId: string }) => {
            const values =
              spreadsheetId === "sheet-a"
                ? [["Player", "Score"], ["Alice", "3"]]
                : [["Player", "Score"], ["Bob", "8"]];
            return Promise.resolve({ data: { values } });
          }),
        },
      },
    };

    const config: Config = {
      sheets: [
        { id: "sheet-a", label: "Player A's Games" },
        { id: "sheet-b", label: "Player B's Games" },
      ],
    };

    const results = await fetchAllSheets(client, config);

    expect(results).toHaveLength(2);
    expect(results[0].label).toBe("Player A's Games");
    expect(results[0].games["Round 1"].rows).toEqual([["Alice", "3"]]);
    expect(results[1].label).toBe("Player B's Games");
    expect(results[1].games["Round 2"].rows).toEqual([["Bob", "8"]]);
  });

  it("quotes tab names in the range parameter", async () => {
    const valuesGet = vi.fn().mockResolvedValue({ data: { values: [["A"], ["1"]] } });

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
            data: { values: [["Col"], ["val"]] },
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
