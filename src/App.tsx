import { useState } from "react";
import * as XLSX from "xlsx";

import analyzeData from "./services/analyzeData.service";
import removeDuplicates from "./services/dataCleaner.service";
import analyzeColumns from "./services/analyzeColumns.service";
import detectStructure from "./services/detectStructure.service";

import type { Row } from "./types/Row.type";
import type { FileStats } from "./types/FileStats.type";
import type { ColumnInfo } from "./types/ColumnInfo.type";
import type { DataStructure } from "./types/DataStructure.type";

function App() {
  const [data, setData] = useState<Row[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [structure, setStructure] =
    useState<DataStructure | null>(null);

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

    // Remove duplicados
    const { cleanedData } = removeDuplicates(jsonData);

    // Analisa as colunas dos dados limpos
    const columnInfo = analyzeColumns(cleanedData);

    // Tenta detectar uma estrutura que possa ser reorganizada
    const detectedStructure = detectStructure(
      cleanedData,
      columnInfo
    );

    setData(cleanedData);
    setStats(fileStats);
    setColumns(columnInfo);
    setStructure(detectedStructure);
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
          <p>Duplicados: {stats.duplicatedRows}</p>
          <p>Linhas únicas: {stats.uniqueRows}</p>
          <p>Células vazias: {stats.emptyCells}</p>

          <h3>Colunas</h3>

          <ul>
            {stats.columnNames.map((column) => (
              <li key={column}>{column}</li>
            ))}
          </ul>
        </section>
      )}

      {columns.length > 0 && (
        <section>
          <h2>Análise das colunas</h2>

          {columns.map((column) => (
            <div key={column.name}>
              <h3>{column.name}</h3>

              <p>Tipo: {column.type}</p>

              <p>
                Valores únicos: {column.uniqueValues}
              </p>

              <p>
                Valores vazios: {column.emptyValues}
              </p>
            </div>
          ))}
        </section>
      )}

      {structure && (
        <section>
          <h2>Estrutura detectada</h2>

          <h3>Colunas de agrupamento</h3>

          <ul>
            {structure.groupColumns.map((column) => (
              <li key={column}>{column}</li>
            ))}
          </ul>

          <p>
            <strong>
              Coluna para reorganizar:
            </strong>{" "}
            {structure.pivotColumn}
          </p>

          <p>
            <strong>
              Coluna de valores:
            </strong>{" "}
            {structure.valueColumn}
          </p>
        </section>
      )}
    </main>
  );
}

export default App;