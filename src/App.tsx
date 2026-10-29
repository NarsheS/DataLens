import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  CheckCircle2,
  Columns3,
  Database,
  Rows3,
} from "lucide-react";

import {
  HeroSection,
  ImportCard,
  FeedbackMessage,
  EmptyState,
  StatsSection,
  ColumnsSection,
  StructureCard,
  ReorganizedTable,
  ChartSection,
  Header,
  Footer,
} from "./components/dashboard";

import {
  analyzeData,
  removeDuplicates,
  analyzeColumns,
  detectStructure,
  reorganizeData,
} from "./services";

import type { Row, FileStats, ColumnInfo, DataStructure } from "./types";

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<FileStats | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [structure, setStructure] = useState<DataStructure | null>(null);
  const [reorganizedData, setReorganizedData] = useState<Row[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnTitles, setColumnTitles] = useState<Record<string, string>>({});
  const [fileName, setFileName] = useState("");
  const [cleanedRows, setCleanedRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    // Permite selecionar novamente o mesmo arquivo.
    event.currentTarget.value = "";
    if (!file) return;

    setIsLoading(true);
    setError("");
    setNotice("");

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        throw new Error("O arquivo não contém nenhuma planilha.");
      }

      const worksheet = workbook.Sheets[firstSheetName];
      if (!worksheet) {
        throw new Error("Não foi possível ler a primeira planilha.");
      }

      const jsonData = XLSX.utils.sheet_to_json<Row>(worksheet);
      if (jsonData.length === 0) {
        throw new Error(
          "Não encontramos dados na primeira planilha do arquivo.",
        );
      }

      // Analisa o arquivo original.
      const fileStats = analyzeData(jsonData);

      // Remove linhas duplicadas.
      const { cleanedData } = removeDuplicates(jsonData);

      // Analisa as colunas após a limpeza.
      const columnInfo = analyzeColumns(cleanedData);

      // Detecta se os dados podem ser reorganizados.
      const detectedStructure = detectStructure(cleanedData, columnInfo);
      const reorganized = detectedStructure
        ? reorganizeData(cleanedData, detectedStructure)
        : [];

      const initialTitles = Object.fromEntries(
        Object.keys(reorganized[0] ?? {}).map((column) => [column, column]),
      );

      setStats(fileStats);
      setColumns(columnInfo);
      setStructure(detectedStructure);
      setReorganizedData(reorganized);
      setColumnTitles(initialTitles);
      setCleanedRows(cleanedData.length);
      setFileName(file.name);
      setCurrentPage(1);
      setPageSize(10);

      if (!detectedStructure) {
        setNotice(
          "Os dados foram analisados, mas não foi possível detectar automaticamente uma estrutura para reorganização.",
        );
      } else if (reorganized.length === 0) {
        setNotice(
          "A estrutura foi identificada, mas não foram geradas linhas para a tabela reorganizada.",
        );
      } else {
        setNotice("");
      }
    } catch (cause) {
      const message =
        cause instanceof Error
          ? cause.message
          : "Ocorreu um erro inesperado ao processar o arquivo.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function exportToCsv() {
    if (reorganizedData.length === 0) return;

    setError("");
    setNotice("");

    const originalColumns = Object.keys(reorganizedData[0] ?? {});
    const headers = originalColumns.map(
      (column) => columnTitles[column]?.trim() || column,
    );
    const normalizedHeaders = headers.map((header) =>
      header.toLocaleLowerCase("pt-BR"),
    );

    if (new Set(normalizedHeaders).size !== headers.length) {
      setError("Cada coluna precisa ter um título diferente.");
      return;
    }

    try {
      const exportData = reorganizedData.map((row) =>
        Object.fromEntries(
          originalColumns.map((column, index) => [
            headers[index],
            row[column] ?? "",
          ]),
        ),
      );

      const worksheet = XLSX.utils.json_to_sheet(exportData, {
        header: headers,
      });
      const csv = XLSX.utils.sheet_to_csv(worksheet, { FS: "," });
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

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice("O CSV foi gerado com os títulos de coluna atuais.");
    } catch {
      setError("Não foi possível exportar o arquivo CSV.");
    }
  }

  const openFilePicker = () => fileInputRef.current?.click();
  const hasData = stats !== null;
  const hasReorganizedData = reorganizedData.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <main className="mx-auto max-w-[1440px] space-y-8 px-5 py-8 sm:px-8 sm:py-10">
        <HeroSection onImport={openFilePicker} isLoading={isLoading} />

        <ImportCard
          fileInputRef={fileInputRef}
          fileName={fileName}
          isLoading={isLoading}
          onFileChange={handleFile}
          onChooseFile={openFilePicker}
        />

        <FeedbackMessage message={error} variant="error" />
        <FeedbackMessage
          message={notice}
          variant="notice"
          icon={<AlertCircle className="mt-0.5 size-5 shrink-0" />}
        />

        {!hasData && (
          <EmptyState onImport={openFilePicker} isLoading={isLoading} />
        )}

        {hasData && stats && (
          <>
            <StatsSection
              stats={stats}
              cleanedRows={cleanedRows}
              icons={{
                rows: <Rows3 className="size-5" />,
                columns: <Columns3 className="size-5" />,
                unique: <Database className="size-5" />,
                empty: <AlertCircle className="size-5" />,
                success: <CheckCircle2 className="size-4 shrink-0" />,
              }}
            />

            <ColumnsSection columns={columns} />

            {structure && <StructureCard structure={structure} />}

            {reorganizedData.length > 0 && (
              <ChartSection data={reorganizedData} />
            )}

            {hasReorganizedData ? (
              <ReorganizedTable
                data={reorganizedData}
                columnTitles={columnTitles}
                onColumnTitleChange={(column, title) =>
                  setColumnTitles((previous) => ({
                    ...previous,
                    [column]: title,
                  }))
                }
                onExport={exportToCsv}
                currentPage={currentPage}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setCurrentPage(1);
                }}
              />
            ) : (
              !structure && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <AlertCircle className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        Nenhuma estrutura de reorganização detectada
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        O arquivo foi analisado, mas o DataLens não conseguiu
                        identificar automaticamente como transformar os dados.
                        Você ainda pode consultar as estatísticas e a análise
                        das colunas acima.
                      </p>
                    </div>
                  </div>
                </section>
              )
            )}
          </>
        )}

        <Footer />
      </main>
    </div>
  );
}

export default App;
