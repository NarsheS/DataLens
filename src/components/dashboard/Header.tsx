import { Database } from 'lucide-react';

const Header = () => {
    return (
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
    )
}

export default Header