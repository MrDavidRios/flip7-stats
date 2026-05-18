import { useEffect, useState } from "react";
import "./App.css";

interface TabData {
  headers: string[];
  rows: string[][];
}

interface SpreadsheetData {
  label: string;
  games: Record<string, TabData>;
}

interface Data {
  fetchedAt: string;
  spreadsheets: SpreadsheetData[];
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
        <p className="error">Could not load data: {error}</p>
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
        <h1>Flip 7 Stats (test)</h1>
        <p className="updated">
          Last updated: {new Date(data.fetchedAt).toLocaleString()}
        </p>
      </header>

      {data.spreadsheets.map((spreadsheet) => (
        <div key={spreadsheet.label}>
          <h2>{spreadsheet.label}</h2>
          {Object.entries(spreadsheet.games).map(([gameName, tab]) => (
            <section key={gameName} className="game-section">
              <h3>{gameName}</h3>
              {tab.rows.length === 0 ? (
                <p className="empty">No data.</p>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        {tab.headers.map((h, i) => (
                          <th key={i}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tab.rows.map((row, ri) => (
                        <tr key={ri}>
                          {tab.headers.map((_, ci) => (
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
      ))}
    </div>
  );
}

export default App;
