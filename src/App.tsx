import { useState } from "react";
import * as XLSX from "xlsx";

import analyzeData from "./services/analyzeData.service";
import removeDuplicates from "./services/dataCleaner.service";
import analyzeColumns from "./services/analyzeColumns.service";
import detectStructure from "./services/detectStructure.service";
import reorganizeData from "./services/reorganizeData.service";

import type { Row } from "./types/Row.type";
import type { FileStats } from "./types/FileStats.type";
import type { ColumnInfo } from "./types/ColumnInfo.type";
import type { DataStructure } from "./types/DataStructure.type";

function App() {
  const [data, setData] = useState<Row[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [structure, setStructure] = useState<DataStructure | null>(null);
  const [reorganizedData, setReorganizedData] = useState<Row[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnTitles, setColumnTitles] = useState<Record<string, string>>({});

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

    const reorganized = detectedStructure
    ? reorganizeData(cleanedData, detectedStructure)
    : [];

    setCurrentPage(1);

    setColumnTitles(
      Object.fromEntries(
        Object.keys(reorganized[0] ?? {}).map(
          (column) => [column, column]
        )
      )
    );
    
    setData(cleanedData);
    setStats(fileStats);
    setColumns(columnInfo);
    setStructure(detectedStructure);
    setReorganizedData(reorganized);
  }

  function exportToCsv() {
    if (reorganizedData.length === 0) {
      return;
    }

    const originalColumns = Object.keys(reorganizedData[0]);

    const headers = originalColumns.map(
      (column) => columnTitles[column]?.trim() || column
    );

    const normalizedHeaders = headers.map(
      (header) => header.toLocaleLowerCase()
    );

    if (new Set(normalizedHeaders).size !== headers.length) {
      alert("Cada coluna precisa ter um título diferente.");
      return;
    }

    const exportData = reorganizedData.map((row) =>
      Object.fromEntries(
        originalColumns.map((column, index) => [
          headers[index],
          row[column] ?? "",
        ])
      )
    );

    const worksheet = XLSX.utils.json_to_sheet(exportData, {
      header: headers,
    });

    const csv = XLSX.utils.sheet_to_csv(worksheet, {
      FS: ",",
    });

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "datalens-dados-reorganizados.csv";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  const totalPages = Math.max(
    1,
    Math.ceil(reorganizedData.length / pageSize)
  );

  const startIndex = (currentPage - 1) * pageSize;

  const visibleRows = reorganizedData.slice(
    startIndex,
    startIndex + pageSize
  );

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


      {reorganizedData.length > 0 && (
        <section>
          <h2>Dados reorganizados</h2>

          <p>
            Linhas resultantes: {reorganizedData.length}
          </p>

          <p>
            Colunas resultantes:{" "}
            {Object.keys(reorganizedData[0]).length}
          </p>

          <table>
            <thead>
              <tr>
                {Object.keys(reorganizedData[0]).map((column) => (
                  <th key={column}>
                    <input
                      type="text"
                      value={columnTitles[column] ?? column}
                      onChange={(event) => {
                        setColumnTitles((previous) => ({
                          ...previous,
                          [column]: event.target.value,
                        }));
                      }}
                      aria-label={`Título da coluna ${column}`}
                    />
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={startIndex + index}>
                  {Object.keys(reorganizedData[0]).map((column) => (
                    <td key={column}>
                      {row[column] === null ||
                      row[column] === undefined
                        ? "—"
                        : String(row[column])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <button
              type="button"
              onClick={exportToCsv}
              disabled={reorganizedData.length === 0}
            >
              Exportar CSV
            </button>
          </table>

          <div>
            <label>
              Linhas por página:{" "}
              <select
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>

            <p>
              Exibindo {reorganizedData.length === 0 ? 0 : startIndex + 1}
              {"–"}
              {Math.min(startIndex + pageSize, reorganizedData.length)}
              {" de "}
              {reorganizedData.length} linhas
            </p>

            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => page - 1)}
            >
              Anterior
            </button>

            <span>
              {" "}Página {currentPage} de {totalPages}{" "}
            </span>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((page) => page + 1)}
            >
              Próxima
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default App;