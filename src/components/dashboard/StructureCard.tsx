import { Sparkles } from "lucide-react";
import type { DataStructure } from "../../types";

type StructureCardProps = {
  structure: DataStructure;
};

const StructureCard = ({ structure }: StructureCardProps) => {
  return (
    <section className="rounded-2xl border border-violet-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
          <Sparkles className="size-5" />
        </div>
        <div>
          <h3 className="font-bold text-slate-950">Estrutura identificada</h3>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            O DataLens encontrou uma estrutura que permite reorganizar os
            registros em formato tabular.
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
  );
}

export default StructureCard;
