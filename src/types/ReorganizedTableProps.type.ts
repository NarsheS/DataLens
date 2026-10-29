import type { Row } from "./Row.type";

type ReorganizedTableProps = {
  data: Row[];
  columnTitles: Record<string, string>;
  onColumnTitleChange: (column: string, title: string) => void;
  onExport: () => void;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
};

export type { ReorganizedTableProps };