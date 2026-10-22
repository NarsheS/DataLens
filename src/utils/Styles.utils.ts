import type { ColumnInfo } from "@/types/ColumnInfo.type";

const Styles: Record<ColumnInfo["type"], string> = {
  text: "bg-blue-50 text-blue-700 ring-blue-600/20",
  number: "bg-violet-50 text-violet-700 ring-violet-600/20",
  date: "bg-amber-50 text-amber-700 ring-amber-600/20",
  boolean: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  mixed: "bg-orange-50 text-orange-700 ring-orange-600/20",
  unknown: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

export default Styles