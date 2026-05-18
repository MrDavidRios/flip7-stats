import { useEffect, useState } from "react";
import "./App.css";

interface SheetData {
  label: string;
  headers: string[];
  rows: string[][];
}

interface Data {
  fetchedAt: string;
  sheets: SheetData[];
}

function App() {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data.json`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to load data (${r.status})`);
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return (
      <div className="container">
        <h1>Flip 7 Stats</h1>
        <p className="error">
          Could not load data: {error}
          <br />
          <small>
            Make sure <code>public/data.json</code> exists. Run{" "}
            <code>npm run fetch-sheets</code> to generate it.
          </small>
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container">
        <h1>Flip 7 Stats</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Flip 7 Stats</h1>
        <p className="updated">
          Last updated: {new Date(data.fetchedAt).toLocaleString()}
        </p>
      </header>

      {data.sheets.map((sheet) => (
        <section key={sheet.label} className="sheet-section">
          <h2>{sheet.label}</h2>
          {sheet.rows.length === 0 ? (
            <p className="empty">No data in this sheet.</p>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    {sheet.headers.map((h, i) => (
                      <th key={i}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheet.rows.map((row, ri) => (
                    <tr key={ri}>
                      {sheet.headers.map((_, ci) => (
                        <td key={ci}>{row[ci] ?? ""}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

export default App;
