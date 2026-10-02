import { useState } from "react";
import * as XLSX from "xlsx";
import analyzeData from "./services/analyzeData";
import removeDuplicates from "./services/dataCleaner";

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

    const jsonData = XLSX.utils.sheet_to_json<Row>(
      worksheet
    );

    // Analisa o arquivo original
    const fileStats = analyzeData(jsonData);

    // Remove duplicados - desestruturação necessária
    const { cleanedData } = removeDuplicates(jsonData);


    setData(cleanedData);
    setStats(fileStats);

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

          <p>Linhas: {stats.rows}</p>

          <p>Colunas: {stats.columns}</p>

          <p>
            Duplicados: {stats.duplicatedRows}
          </p>

          <p>
            Linhas únicas: {stats.uniqueRows}
          </p>

          <p>
            Células vazias: {stats.emptyCells}
          </p>

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