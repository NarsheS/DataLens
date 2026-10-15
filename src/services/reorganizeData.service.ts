
import type { Row } from "../types/Row.type";
import type { DataStructure } from "../types/DataStructure.type";

function createKey(row: Row, columns: string[]): string {
  return JSON.stringify(
    columns.map((column) => row[column] ?? null)
  );
}

function reorganizeData(
  data: Row[],
  structure: DataStructure
): Row[] {
  if (data.length === 0) {
    return [];
  }

  const {
    groupColumns,
    pivotColumn,
    valueColumn,
  } = structure;

  const groups = new Map<string, Row>();
  const pivotValues = new Set<string>();

  for (const row of data) {
    const pivotValue = row[pivotColumn];

    // Não é possível criar uma coluna sem categoria.
    if (
      pivotValue === null ||
      pivotValue === undefined ||
      String(pivotValue).trim() === ""
    ) {
      continue;
    }

    const pivotName = String(pivotValue);
    pivotValues.add(pivotName);

    const groupKey = createKey(row, groupColumns);

    let reorganizedRow = groups.get(groupKey);

    if (!reorganizedRow) {
      reorganizedRow = {};

      for (const column of groupColumns) {
        reorganizedRow[column] = row[column];
      }

      groups.set(groupKey, reorganizedRow);
    }

    // Preserva o valor original, inclusive marcadores
    // como "C", em vez de convertê-los silenciosamente.
    if (
      Object.prototype.hasOwnProperty.call(
        reorganizedRow,
        pivotName
      )
    ) {
      throw new Error(
        `Não foi possível reorganizar os dados: ` +
        `existem múltiplos valores para o grupo ` +
        `"${groupKey}" e a categoria "${pivotName}".`
      );
    }

    reorganizedRow[pivotName] = row[valueColumn];
  }

  return Array.from(groups.values());
}

export default reorganizeData;