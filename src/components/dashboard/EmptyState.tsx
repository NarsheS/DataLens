import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "../ui/button";
import type { GeneralStateProps } from "../../types";


const EmptyState = ({ onImport, isLoading }: GeneralStateProps) => {
  return (
    <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center sm:py-20">
      <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
        <FileSpreadsheet className="size-8" />
      </div>
      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        Seus dados começam aqui
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Importe um arquivo Excel ou CSV para visualizar estatísticas, analisar
        colunas e preparar seus dados para exportação.
      </p>
      <Button
        onClick={onImport}
        disabled={isLoading}
        className="mt-6 gap-2 rounded-xl bg-violet-600 hover:bg-violet-700"
      >
        <Upload className="size-4" />
        Selecionar primeiro arquivo
      </Button>
    </section>
  );
}

export default EmptyState;
