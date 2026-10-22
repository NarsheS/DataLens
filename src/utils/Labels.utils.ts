import type { ColumnInfo } from "@/types/ColumnInfo.type";

const Labels: Record<ColumnInfo["type"], string> = {
  text: "Texto",
  number: "Numérico",
  date: "Data",
  boolean: "Booleano",
  mixed: "Misto",
  unknown: "Indefinido",
};

export default Labels