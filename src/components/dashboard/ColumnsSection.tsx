import type { ColumnInfo } from "../../types";
import { Labels, Styles } from "../../utils";
import { formatNumber } from "../../services";

type ColumnsSectionProps = {
  columns: ColumnInfo[];
};

const ColumnsSection = ({ columns }: ColumnsSectionProps) => {
  return (
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
                className={`shrink-0 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${Styles[column.type]}`}
              >
                {Labels[column.type]}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-500">Valores únicos</p>
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
  );
}

export default ColumnsSection;
