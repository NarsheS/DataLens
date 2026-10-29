import StatCard from "./StatCard";
import { formatNumber } from "../../services";
import type { StatsSectionProps } from "../../types";


const StatsSection = ({ stats, cleanedRows, icons }: StatsSectionProps) => {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-slate-950">Resumo do arquivo</h3>
        <p className="mt-1 text-sm text-slate-500">
          Visão geral da qualidade dos dados importados.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={icons.rows}
          label="Linhas originais"
          value={formatNumber(stats.rows)}
          description="Registros encontrados"
          iconClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={icons.columns}
          label="Colunas"
          value={formatNumber(stats.columns)}
          description="Campos identificados"
          iconClass="bg-violet-50 text-violet-600"
        />
        <StatCard
          icon={icons.unique}
          label="Linhas únicas"
          value={formatNumber(stats.uniqueRows)}
          description={`${formatNumber(stats.duplicatedRows)} duplicadas detectadas`}
          iconClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={icons.empty}
          label="Células vazias"
          value={formatNumber(stats.emptyCells)}
          description="No arquivo original"
          iconClass="bg-amber-50 text-amber-600"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        {icons.success}
        <span>
          Após a remoção de duplicados, foram mantidas{" "}
          <strong>{formatNumber(cleanedRows)}</strong> linhas para análise.
        </span>
      </div>
    </section>
  );
}

export default StatsSection;
