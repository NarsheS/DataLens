import { useState } from "react";
import * as XLSX from "xlsx";
import analyzeData from "./services/analyzeData";

import type { Row } from "./types/RowType";
import type { FileStats } from "./types/FileStatsType";

function App() {
  const [data, setData] = useState<Row[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);

  async function handleFile(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array",
    });

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    const jsonData = XLSX.utils.sheet_to_json<Row>(worksheet);

    setData(jsonData);

    const analysis = analyzeData(jsonData);

    setStats(analysis);

    console.log(jsonData);
    console.log(analysis);
  }

  return (
    <main>
      <h1>DataLens</h1>

      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFile}
      />

      {stats && (
        <section>
          <h2>Resumo do arquivo</h2>

          <div>
            <strong>{stats.rows}</strong>
            <span> registros</span>
          </div>

          <div>
            <strong>{stats.columns}</strong>
            <span> colunas</span>
          </div>

          <div>
            <strong>{stats.emptyCells}</strong>
            <span> células vazias</span>
          </div>

          <div>
            <strong>{stats.duplicatedRows}</strong>
            <span> registros duplicados</span>
          </div>

          <div>
            <strong>{stats.uniqueRows}</strong>
            <span> registros únicos</span>
          </div>

          <h3>Colunas</h3>

          <ul>
            {stats.columnNames.map((column) => (
              <li key={column}>{column}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export default App;