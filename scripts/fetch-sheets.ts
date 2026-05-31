import { google, type sheets_v4 } from "googleapis";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

export interface SpreadsheetConfig {
  id: string;
  label: string;
}

export interface Config {
  sheets: SpreadsheetConfig[];
}

export interface TabData {
  headers: string[];
  rows: string[][];
}

export interface SpreadsheetData {
  label: string;
  games: Record<string, TabData>;
}

export interface FetchResult {
  fetchedAt: string;
  spreadsheets: SpreadsheetData[];
}

export interface SheetsClient {
  spreadsheets: {
    get: (params: { spreadsheetId: string; fields: string }) => Promise<{
      data: { sheets?: { properties?: { title?: string | null } }[] };
    }>;
    values: {
      get: (params: { spreadsheetId: string; range: string }) => Promise<{
        data: { values?: unknown[][] };
      }>;
    };
  };
}

function isNumeric(value: unknown): boolean {
  return typeof value === "string" && value !== "" && !isNaN(Number(value));
}

export function parseTabData(values: unknown[][]): TabData {
  if (values.length === 0) return { headers: [], rows: [] };

  let dataStartIndex = -1;
  for (let i = 0; i < values.length; i++) {
    const row = values[i];
    const colA = String(row[0] ?? "").trim();
    const colB = String(row[1] ?? "").trim();

    if (colA !== "" && !isNumeric(colA) && isNumeric(colB)) {
      dataStartIndex = i;
      break;
    }
  }

  if (dataStartIndex === -1) {
    const [first, ...rest] = values;
    return {
      headers: (first as string[]).map((h) => String(h ?? "")),
      rows: rest.map((r) => (r as string[]).map((c) => String(c ?? ""))),
    };
  }

  const rows = values.slice(dataStartIndex).map((r) =>
    (r as string[]).map((c) => String(c ?? ""))
  );

  const numCols = Math.max(...rows.map((r) => r.length));
  const headers = ["Player", "Total"];
  for (let i = 2; i < numCols; i++) {
    headers.push(`Round ${i - 1}`);
  }

  return { headers, rows };
}

export async function fetchAllSheets(
  sheetsApi: SheetsClient,
  config: Config
): Promise<SpreadsheetData[]> {
  const results: SpreadsheetData[] = [];

  for (const spreadsheet of config.sheets) {
    const meta = await sheetsApi.spreadsheets.get({
      spreadsheetId: spreadsheet.id,
      fields: "sheets.properties.title",
    });

    const tabNames =
      meta.data.sheets
        ?.map((s) => s.properties?.title)
        .filter((t): t is string => t != null) ?? [];

    const games: Record<string, TabData> = {};

    for (const tabName of tabNames) {
      const response = await sheetsApi.spreadsheets.values.get({
        spreadsheetId: spreadsheet.id,
        range: `'${tabName}'`,
      });

      games[tabName] = parseTabData(response.data.values ?? []);
    }

    results.push({ label: spreadsheet.label, games });
  }

  return results;
}

async function main() {
  const apiKey = process.env.GOOGLE_API_KEY;

  const sheetsApi = apiKey
    ? google.sheets({ version: "v4", auth: apiKey })
    : google.sheets({
        version: "v4",
        auth: new google.auth.GoogleAuth({
          scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
        }),
      });

  const config: Config = JSON.parse(
    readFileSync(resolve(ROOT, "sheets-config.json"), "utf-8")
  );

  console.log("Fetching sheet data...");
  const spreadsheets = await fetchAllSheets(
    sheetsApi as unknown as SheetsClient,
    config
  );

  const output: FetchResult = {
    fetchedAt: new Date().toISOString(),
    spreadsheets,
  };

  const outPath = resolve(ROOT, "public", "data.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Wrote ${outPath}`);
}

const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("fetch-sheets.ts");

if (isMainModule) {
  main();
}
