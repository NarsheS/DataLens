import { FileSpreadsheet, Upload } from "lucide-react";
import { Button } from "../ui/button";
import type { ImportCardProps } from "../../types";


const ImportCard = ({
  fileInputRef,
  fileName,
  isLoading,
  onFileChange,
  onChooseFile,
}: ImportCardProps) => {
  return (
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
            Selecione um arquivo para começar a análise. O DataLens trabalha
            com a primeira planilha do arquivo selecionado.
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
            onChange={onFileChange}
            className="hidden"
          />
          <Button
            variant="outline"
            onClick={onChooseFile}
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
  );
}

export default ImportCard;
