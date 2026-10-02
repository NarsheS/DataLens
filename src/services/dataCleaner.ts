import type { Row } from "../types/RowType";

// remove duplicatas do arquivo
function removeDuplicates(data: Row[]): {
  cleanedData: Row[];
  duplicatedRows: number;
} {
  const seen = new Set<string>();
  const cleanedData: Row[] = [];

  for (const row of data) {
    const rowKey = JSON.stringify(row);

    if (!seen.has(rowKey)) {
      seen.add(rowKey);
      cleanedData.push(row);
    }
  }

  return {
    cleanedData,
    duplicatedRows: data.length - cleanedData.length,
  };
}

export default removeDuplicates