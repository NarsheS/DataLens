type FileStats = {
  rows: number;
  columns: number;
  emptyCells: number;
  duplicatedRows: number;
  uniqueRows: number;
  columnNames: string[];
};

export type { FileStats }