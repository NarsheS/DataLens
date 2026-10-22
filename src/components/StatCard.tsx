import type { StatCardProps } from "../types";

const StatCard = ({
  icon,
  label,
  value,
  description,
  iconClass,
}: StatCardProps) => {
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

export default StatCard