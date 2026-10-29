import { useMemo } from "react";
import { ChevronLeft, ChevronRight, Download, Table2 } from "lucide-react";
import { Button } from "../ui/button";
import { formatNumber } from "../../services";
import type { ReorganizedTableProps } from "../../types"

const ReorganizedTable = ({
  data,
  columnTitles,
  onColumnTitleChange,
  onExport,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}: ReorganizedTableProps) => {
  const originalColumns = useMemo(
    () => Object.keys(data[0] ?? {}),
    [data],
  );
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRows = data.slice(startIndex, startIndex + pageSize);
  const displayedEnd = Math.min(startIndex + pageSize, data.length);

  return (
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
              Revise os resultados e personalize os cabeçalhos antes de
              exportar.
            </p>
          </div>
        </div>

        <Button
          onClick={onExport}
          className="h-10 shrink-0 gap-2 rounded-xl bg-violet-600 px-4 font-semibold hover:bg-violet-700"
        >
          <Download className="size-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 sm:grid-cols-3">
        <div className="border-r border-slate-200 px-5 py-4">
          <p className="text-xs text-slate-500">Linhas resultantes</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatNumber(data.length)}
          </p>
        </div>
        <div className="px-5 py-4 sm:border-r sm:border-slate-200">
          <p className="text-xs text-slate-500">Colunas resultantes</p>
          <p className="mt-1 text-xl font-bold text-slate-900">
            {formatNumber(originalColumns.length)}
          </p>
        </div>
        <div className="col-span-2 border-t border-slate-200 px-5 py-4 sm:col-span-1 sm:border-t-0">
          <p className="text-xs text-slate-500">Pré-visualização</p>
          <p className="mt-1 text-sm font-semibold text-emerald-700">
            Dados prontos para revisão
          </p>
        </div>
      </div>

      <div className="border-b border-slate-200 bg-violet-50/50 px-5 py-3 sm:px-6">
        <p className="text-xs leading-5 text-violet-900">
          <strong>Dica:</strong> você pode editar os títulos diretamente nos
          campos da tabela. As alterações serão aplicadas ao CSV exportado.
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
                    onChange={(event) =>
                      onColumnTitleChange(column, event.target.value)
                    }
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
                {originalColumns.map((column) => {
                  const value = row[column];
                  const isEmpty =
                    value === null || value === undefined || value === "";

                  return (
                    <td
                      key={column}
                      className="max-w-80 border-b border-r border-slate-100 px-4 py-3 text-slate-600 last:border-r-0"
                    >
                      <div
                        className="max-w-80 truncate"
                        title={isEmpty ? "" : String(value)}
                      >
                        {isEmpty ? (
                          <span className="text-slate-300">—</span>
                        ) : (
                          String(value)
                        )}
                      </div>
                    </td>
                  );
                })}
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
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
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
            Exibindo {formatNumber(data.length ? startIndex + 1 : 0)}–
            {formatNumber(displayedEnd)} de {formatNumber(data.length)} linhas
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="gap-1 rounded-lg"
          >
            <ChevronLeft className="size-4" />
            Anterior
          </Button>

          <span className="whitespace-nowrap text-sm text-slate-600">
            Página <strong className="text-slate-900">{currentPage}</strong> de{" "}
            {totalPages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="gap-1 rounded-lg"
          >
            Próxima
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

export default ReorganizedTable;
