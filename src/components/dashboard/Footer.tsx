const Footer = () => {
    return (
        <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 py-5 text-xs text-slate-400 sm:flex-row sm:items-center">
          <p>
            <span className="font-semibold text-slate-500">DataLens</span>
            {" "}— Análise e transformação de dados.
          </p>
          <p>Feito para tornar dados mais fáceis de entender.</p>
        </footer>
    )
}

export default Footer