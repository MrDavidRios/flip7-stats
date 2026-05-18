import { google } from "googleapis";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

interface SheetConfig {
  id: string;
  range: string;
  label: string;
}

interface Config {
  sheets: SheetConfig[];
}

interface SheetData {
  label: string;
  headers: string[];
  rows: string[][];
}

async function main() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!credentialsJson) {
    console.error(
      "Missing GOOGLE_SERVICE_ACCOUNT_KEY environment variable.\n" +
        "Set it to the contents of your service account JSON key file."
    );
    process.exit(1);
  }

  const credentials = JSON.parse(credentialsJson);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  const config: Config = JSON.parse(
    readFileSync(resolve(ROOT, "sheets-config.json"), "utf-8")
  );

  const results: SheetData[] = [];

  for (const sheet of config.sheets) {
    console.log(`Fetching "${sheet.label}" (${sheet.id})...`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheet.id,
      range: sheet.range,
    });

    const values = response.data.values ?? [];
    if (values.length === 0) {
      console.warn(`  Warning: sheet "${sheet.label}" returned no data.`);
      results.push({ label: sheet.label, headers: [], rows: [] });
      continue;
    }

    const [headers, ...rows] = values;
    results.push({
      label: sheet.label,
      headers: headers as string[],
      rows: rows as string[][],
    });
    console.log(`  Got ${rows.length} rows.`);
  }

  const output = {
    fetchedAt: new Date().toISOString(),
    sheets: results,
  };

  const outPath = resolve(ROOT, "public", "data.json");
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nWrote ${outPath}`);
}

main();
