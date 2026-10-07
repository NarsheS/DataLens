import type { FileStats } from "../types/FileStats.type";
import type { Row } from "../types/Row.type";

function analyzeData(data: Row[]): FileStats {
  const rows = data.length;

  if (rows === 0) {
    return {
      rows: 0,
      columns: 0,
      emptyCells: 0,
      duplicatedRows: 0,
      uniqueRows: 0,
      columnNames: [],
    };
  }

  const columnNames = Object.keys(data[0]);
  const columns = columnNames.length;

  let emptyCells = 0;

  for (const row of data) {
    for (const column of columnNames) {
      const value = row[column];

      if (
        value === null ||
        value === undefined ||
        String(value).trim() === ""
      ) {
        emptyCells++;
      }
    }
  }

  const rowStrings = data.map((row) =>
    JSON.stringify(row)
  );

  const uniqueRowsSet = new Set(rowStrings);

  const uniqueRows = uniqueRowsSet.size;
  const duplicatedRows = rows - uniqueRows;

  return {
    rows,
    columns,
    emptyCells,
    duplicatedRows,
    uniqueRows,
    columnNames,
  };
}

export default analyzeData