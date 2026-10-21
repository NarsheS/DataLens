
import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import * as XLSX from "xlsx";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Database,
  Download,
  FileSpreadsheet,
  Rows3,
  Sparkles,
  Table2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import analyzeData from "./services/analyzeData.service";
import removeDuplicates from "./services/dataCleaner.service";
import analyzeColumns from "./services/analyzeColumns.service";
import detectStructure from "./services/detectStructure.service";
import reorganizeData from "./services/reorganizeData.service";

import type { Row } from "./types/Row.type";
import type { FileStats } from "./types/FileStats.type";
import type { ColumnInfo } from "./types/ColumnInfo.type";
import type { DataStructure } from "./types/DataStructure.type";

const numberFormatter = new Intl.NumberFormat("pt-BR");

const typeLabels: Record<ColumnInfo["type"], string> = {
  text: "Texto",
  number: "Numérico",
  date: "Data",
  boolean: "Booleano",
  mixed: "Misto",
  unknown: "Indefinido",
};

const typeStyles: Record<ColumnInfo["type"], string> = {
  text: "bg-blue-50 text-blue-700 ring-blue-600/20",
  number: "bg-violet-50 text-violet-700 ring-violet-600/20",
  date: "bg-amber-50 text-amber-700 ring-amber-600/20",
  boolean: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  mixed: "bg-orange-50 text-orange-700 ring-orange-600/20",
  unknown: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

function formatNumber(value: number) {
  return numberFormatter.format(value);
}

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stats, setStats] = useState<FileStats | null>(null);
  const [columns, setColumns] = useState<ColumnInfo[]>([]);
  const [structure, setStructure] = useState<DataStructure | null>(null);
  const [reorganizedData, setReorganizedData] = useState<Row[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [columnTitles, setColumnTitles] = useState<Record<string, string>>(
    {}
  );
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

      const workbook = XLSX.read(buffer, {
        type: "array",
      });

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
          "Não encontramos dados na primeira planilha do arquivo."
        );
      }

      // Analisa o arquivo original.
      const fileStats = analyzeData(jsonData);

      // Remove linhas duplicadas.
      const { cleanedData } = removeDuplicates(jsonData);

      // Analisa as colunas após a limpeza.
      const columnInfo = analyzeColumns(cleanedData);

      // Detecta se os dados podem ser reorganizados.
      const detectedStructure = detectStructure(
        cleanedData,
        columnInfo
      );

      const reorganized = detectedStructure
        ? reorganizeData(cleanedData, detectedStructure)
        : [];

      const initialTitles = Object.fromEntries(
        Object.keys(reorganized[0] ?? {}).map((column) => [
          column,
          column,
        ])
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
          "Os dados foram analisados, mas não foi possível detectar automaticamente uma estrutura para reorganização."
        );
      } else if (reorganized.length === 0) {
        setNotice(
          "A estrutura foi identificada, mas não foram geradas linhas para a tabela reorganizada."
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

    const originalColumns = Object.keys(reorganizedData[0]);

    const headers = originalColumns.map(
      (column) => columnTitles[column]?.trim() || column
    );

    const normalizedHeaders = headers.map((header) =>
      header.toLocaleLowerCase("pt-BR")
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

      window.setTimeout(() => URL.revokeObjectURL(url), 1000);

      setNotice("O CSV foi gerado com os títulos de coluna atuais.");
    } catch {
      setError("Não foi possível exportar o arquivo CSV.");
    }
  }

  const originalColumns = Object.keys(reorganizedData[0] ?? {});
  const totalPages = Math.max(
    1,
    Math.ceil(reorganizedData.length / pageSize)
  );

  const startIndex = (currentPage - 1) * pageSize;

  const visibleRows = reorganizedData.slice(
    startIndex,
    startIndex + pageSize
  );

  const hasData = stats !== null;
  const hasReorganizedData = reorganizedData.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm shadow-violet-200">
              <Database className="size-6" />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-950">
                DataLens
              </h1>
              <p className="text-xs text-slate-500">
                Análise e transformação de dados
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex">
            <span className="size-2 rounded-full bg-emerald-500" />
            Processamento local
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-8 px-5 py-8 sm:px-8 sm:py-10">
        <section className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              <Sparkles className="size-3.5" />
              Seu espaço de análise
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Transforme dados em
              <span className="text-violet-600"> informação.</span>
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Importe uma planilha, identifique problemas de qualidade e
              reorganize seus dados em uma tabela pronta para exportação.
            </p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="h-11 shrink-0 gap-2 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700"
          >
            <Upload className="size-4" />
            {isLoading ? "Processando arquivo..." : "Importar arquivo"}
          </Button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="size-5 text-violet-600" />
                <h3 className="font-semibold text-slate-900">
                  Importação de dados
                </h3>
              </div>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Selecione um arquivo para começar a análise. O DataLens
                trabalha com a primeira planilha do arquivo selecionado.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {[".CSV", ".XLSX", ".XLS"].map((format) => (
                  <span
                    key={format}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col items-start gap-2 md:items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFile}
                className="hidden"
              />

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="h-10 gap-2 rounded-lg border-slate-300"
              >
                <Upload className="size-4" />
                Escolher arquivo
              </Button>

              {fileName && (
                <p className="max-w-64 break-all text-xs text-slate-500">
                  Arquivo atual: {fileName}
                </p>
              )}
            </div>
          </div>

          {isLoading && (
            <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-violet-100">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-violet-600" />
            </div>
          )}
        </section>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Não foi possível concluir a operação</p>
              <p className="mt-1">{error}</p>
            </div>
          </div>
        )}

        {notice && !error && (
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800"
          >
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <p>{notice}</p>
          </div>
        )}

        {!hasData && (
          <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:py-20">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <FileSpreadsheet className="size-8" />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-slate-900">
              Seus dados começam aqui
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Importe um arquivo Excel ou CSV para visualizar estatísticas,
              analisar colunas e preparar seus dados para exportação.
            </p>

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className="mt-6 gap-2 rounded-xl bg-violet-600 hover:bg-violet-700"
            >
              <Upload className="size-4" />
              Selecionar primeiro arquivo
            </Button>
          </section>
        )}

        {hasData && stats && (
          <>
            <section className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-950">
                  Resumo do arquivo
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Visão geral da qualidade dos dados importados.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                  icon={<Rows3 className="size-5" />}
                  label="Linhas originais"
                  value={formatNumber(stats.rows)}
                  description="Registros encontrados"
                  iconClass="bg-blue-50 text-blue-600"
                />

                <StatCard
                  icon={<Columns3 className="size-5" />}
                  label="Colunas"
                  value={formatNumber(stats.columns)}
                  description="Campos identificados"
                  iconClass="bg-violet-50 text-violet-600"
                />

                <StatCard
                  icon={<Database className="size-5" />}
                  label="Linhas únicas"
                  value={formatNumber(stats.uniqueRows)}
                  description={`${formatNumber(stats.duplicatedRows)} duplicadas detectadas`}
                  iconClass="bg-emerald-50 text-emerald-600"
                />

                <StatCard
                  icon={<AlertCircle className="size-5" />}
                  label="Células vazias"
                  value={formatNumber(stats.emptyCells)}
                  description="No arquivo original"
                  iconClass="bg-amber-50 text-amber-600"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>
                  Após a remoção de duplicados, foram mantidas{" "}
                  <strong>{formatNumber(cleanedRows)}</strong> linhas para
                  análise.
                </span>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">
                    Análise das colunas
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Tipos de dados e indicadores de cada campo.
                  </p>
                </div>

                <span className="text-sm text-slate-500">
                  {formatNumber(columns.length)} colunas analisadas
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {columns.map((column) => (
                  <article
                    key={column.name}
                    className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h4
                        className="break-words text-sm font-semibold text-slate-900"
                        title={column.name}
                      >
                        {column.name}
                      </h4>

                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          typeStyles[column.type]
                        }`}
                      >
                        {typeLabels[column.type]}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <p className="text-xs text-slate-500">
                          Valores únicos
                        </p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {formatNumber(column.uniqueValues)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">Vazios</p>
                        <p className="mt-1 text-lg font-semibold text-slate-900">
                          {formatNumber(column.emptyValues)}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {structure && (
              <section className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                    <Sparkles className="size-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-950">
                      Estrutura identificada
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      O DataLens encontrou uma estrutura que permite
                      reorganizar os registros em formato tabular.
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Agrupamento
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {structure.groupColumns.map((column) => (
                        <span
                          key={column}
                          className="break-all rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-700"
                        >
                          {column}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Coluna de reorganização
                    </p>
                    <p className="mt-3 break-words text-sm font-semibold text-violet-700">
                      {structure.pivotColumn}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      Coluna de valores
                    </p>
                    <p className="mt-3 break-words text-sm font-semibold text-slate-900">
                      {structure.valueColumn}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {hasReorganizedData ? (
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col justify-between gap-4 border-b border-slate-200 p-5 sm:p-6 lg:flex-row lg:items-center">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                      <Table2 className="size-5" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-950">
                        Dados reorganizados
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Revise os resultados e personalize os cabeçalhos
                        antes de exportar.
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={exportToCsv}
                    className="h-10 shrink-0 gap-2 rounded-xl bg-violet-600 px-4 font-semibold hover:bg-violet-700"
                  >
                    <Download className="size-4" />
                    Exportar CSV
                  </Button>
                </div>

                <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 sm:grid-cols-3">
                  <div className="border-r border-slate-200 px-5 py-4">
                    <p className="text-xs text-slate-500">
                      Linhas resultantes
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {formatNumber(reorganizedData.length)}
                    </p>
                  </div>

                  <div className="px-5 py-4 sm:border-r sm:border-slate-200">
                    <p className="text-xs text-slate-500">
                      Colunas resultantes
                    </p>
                    <p className="mt-1 text-xl font-bold text-slate-900">
                      {formatNumber(originalColumns.length)}
                    </p>
                  </div>

                  <div className="col-span-2 border-t border-slate-200 px-5 py-4 sm:col-span-1 sm:border-t-0">
                    <p className="text-xs text-slate-500">
                      Pré-visualização
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-700">
                      Dados prontos para revisão
                    </p>
                  </div>
                </div>

                <div className="border-b border-slate-200 bg-violet-50/50 px-5 py-3 sm:px-6">
                  <p className="text-xs leading-5 text-violet-900">
                    <strong>Dica:</strong> você pode editar os títulos
                    diretamente nos campos da tabela. As alterações serão
                    aplicadas ao CSV exportado.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-max border-collapse text-left text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        {originalColumns.map((column) => (
                          <th
                            key={column}
                            className="min-w-52 border-b border-r border-slate-200 p-3 align-top last:border-r-0"
                          >
                            <label className="mb-2 block text-xs font-medium text-slate-500">
                              Nome da coluna
                            </label>
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
                              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                            />
                            <p
                              className="mt-2 truncate text-xs font-normal text-slate-400"
                              title={column}
                            >
                              Original: {column}
                            </p>
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {visibleRows.map((row, index) => (
                        <tr
                          key={startIndex + index}
                          className="transition-colors hover:bg-violet-50/40"
                        >
                          {originalColumns.map((column) => (
                            <td
                              key={column}
                              className="max-w-80 border-b border-r border-slate-100 px-4 py-3 text-slate-600 last:border-r-0"
                            >
                              <div className="max-w-80 truncate" title={
                                row[column] === null ||
                                row[column] === undefined
                                  ? ""
                                  : String(row[column])
                              }>
                                {row[column] === null ||
                                row[column] === undefined ||
                                row[column] === ""
                                  ? <span className="text-slate-300">—</span>
                                  : String(row[column])}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="flex items-center gap-2 text-sm text-slate-600">
                      Linhas por página
                      <select
                        value={pageSize}
                        onChange={(event) => {
                          setPageSize(Number(event.target.value));
                          setCurrentPage(1);
                        }}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
                      >
                        {[10, 25, 50, 100].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>

                    <p className="text-sm text-slate-500">
                      Exibindo{" "}
                      {formatNumber(startIndex + 1)}–
                      {formatNumber(
                        Math.min(
                          startIndex + pageSize,
                          reorganizedData.length
                        )
                      )}{" "}
                      de {formatNumber(reorganizedData.length)} linhas
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      className="gap-1 rounded-lg"
                    >
                      <ChevronLeft className="size-4" />
                      Anterior
                    </Button>

                    <span className="whitespace-nowrap text-sm text-slate-600">
                      Página{" "}
                      <strong className="text-slate-900">
                        {currentPage}
                      </strong>{" "}
                      de {totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= totalPages}
                      onClick={() =>
                        setCurrentPage((page) =>
                          Math.min(totalPages, page + 1)
                        )
                      }
                      className="gap-1 rounded-lg"
                    >
                      Próxima
                      <ChevronRight className="size-4" />
                    </Button>
                  </div>
                </div>
              </section>
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
                        identificar automaticamente como transformar os
                        dados. Você ainda pode consultar as estatísticas e
                        a análise das colunas acima.
                      </p>
                    </div>
                  </div>
                </section>
              )
            )}
          </>
        )}

        <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>
            <span className="font-semibold text-slate-500">DataLens</span>
            {" "}— Análise e transformação de dados.
          </p>
          <p>Feito para tornar dados mais fáceis de entender.</p>
        </footer>
      </main>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  iconClass: string;
};

function StatCard({
  icon,
  label,
  value,
  description,
  iconClass,
}: StatCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>

        <div className={`flex size-11 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </div>
      </div>

      <p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </article>
  );
}

export default App;