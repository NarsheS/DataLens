import type { ReactNode } from "react";
import type { FileStats } from "./FileStats.type";

type StatsSectionProps = {
  stats: FileStats;
  cleanedRows: number;
  icons: {
    rows: ReactNode;
    columns: ReactNode;
    unique: ReactNode;
    empty: ReactNode;
    success: ReactNode;
  };
};

export type { StatsSectionProps };