import { Sparkles, Upload } from "lucide-react";
import { Button } from "../ui/button";
import type { GeneralStateProps } from "../../types";


const HeroSection = ({ onImport, isLoading }: GeneralStateProps) => {
  return (
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
          Importe uma planilha, identifique problemas de qualidade e reorganize
          seus dados em uma tabela pronta para exportação.
        </p>
      </div>

      <Button
        onClick={onImport}
        disabled={isLoading}
        className="h-11 shrink-0 gap-2 rounded-xl bg-violet-600 px-5 font-semibold text-white hover:bg-violet-700"
      >
        <Upload className="size-4" />
        {isLoading ? "Processando arquivo..." : "Importar arquivo"}
      </Button>
    </section>
  );
}

export default HeroSection;
