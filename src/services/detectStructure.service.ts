import type { Row } from "../types/Row.type";
import type { ColumnInfo } from "../types/ColumnInfo.type";
import type { DataStructure } from "../types/DataStructure.type";

function createKey(row: Row, columns: string[]): string {
  return columns
    .map((column) => String(row[column] ?? ""))
    .join("||");
}

function isUniqueCombination(
  data: Row[],
  columns: string[]
): boolean {
  const keys = new Set<string>();

  for (const row of data) {
    const key = createKey(row, columns);

    if (keys.has(key)) {
      return false;
    }

    keys.add(key);
  }

  return true;
}

function detectStructure(
  data: Row[],
  columns: ColumnInfo[]
): DataStructure | null {
  if (data.length === 0 || columns.length < 3) {
    return null;
  }

  const numericColumns = columns.filter(
    (column) => column.type === "number"
  );

  if (numericColumns.length === 0) {
    return null;
  }

  const candidates: {
    structure: DataStructure;
    score: number;
  }[] = [];

  /*
   * Procuramos uma coluna numérica para representar
   * os valores da tabela reorganizada.
   */
  for (const valueColumn of numericColumns) {
    const remainingColumns = columns.filter(
      (column) => column.name !== valueColumn.name
    );

    /*
     * Cada coluna restante pode ser a coluna que contém
     * os valores que futuramente virarão novas colunas.
     */
    for (const pivotColumn of remainingColumns) {
      const possibleGroupColumns = remainingColumns.filter(
        (column) => column.name !== pivotColumn.name
      );

      /*
       * Procuramos combinações de agrupamento.
       */
      for (
        let size = 1;
        size <= possibleGroupColumns.length;
        size++
      ) {
        const combinations = getCombinations(
          possibleGroupColumns.map(
            (column) => column.name
          ),
          size
        );

        for (const groupColumns of combinations) {
          const uniqueWithPivot = isUniqueCombination(
            data,
            [...groupColumns, pivotColumn.name]
          );

          const groupIsNotUnique =
            !isUniqueCombination(data, groupColumns);

          if (
            uniqueWithPivot &&
            groupIsNotUnique
          ) {
            const score = calculateScore(
              pivotColumn,
              groupColumns,
              columns
            );

            candidates.push({
              structure: {
                groupColumns,
                pivotColumn: pivotColumn.name,
                valueColumn: valueColumn.name,
              },
              score,
            });
          }
        }
      }
    }
  }

  if (candidates.length === 0) {
    return null;
  }

  /*
   * Ordena da melhor estrutura para a pior.
   */
  candidates.sort(
    (a, b) => b.score - a.score
  );

  return candidates[0].structure;
}

function calculateScore(
  pivotColumn: ColumnInfo,
  groupColumns: string[],
  columns: ColumnInfo[]
): number {
  let score = 0;

  /*
   * Preferimos pivots com poucos valores únicos.
   *
   * Uma coluna com 9 categorias é mais interessante
   * para virar novas colunas do que uma coluna com
   * 15 anos, por exemplo.
   */
  score -= pivotColumn.uniqueValues;

  /*
   * Penaliza estruturas que precisam de muitas
   * colunas para identificar cada registro.
   */
  score -= groupColumns.length * 5;

  /*
   * Colunas de texto categóricas são boas candidatas
   * para pivot.
   */
  if (pivotColumn.type === "text") {
    score += 20;
  }

  /*
   * Colunas que parecem representar tempo são
   * melhores como agrupamento do que como pivot.
   */
  const pivotName = pivotColumn.name.toLowerCase();

  if (
    pivotName.includes("year") ||
    pivotName.includes("ano") ||
    pivotName.includes("date") ||
    pivotName.includes("data")
  ) {
    score -= 20;
  }

  /*
   * Colunas com poucos valores únicos são preferidas
   * como agrupamento quando necessário.
   */
  for (const groupColumnName of groupColumns) {
    const groupColumn = columns.find(
      (column) => column.name === groupColumnName
    );

    if (!groupColumn) {
      continue;
    }

    if (groupColumn.type === "text") {
      score += 2;
    }

    const name = groupColumn.name.toLowerCase();

    if (
      name.includes("year") ||
      name.includes("ano") ||
      name.includes("date") ||
      name.includes("data")
    ) {
      score += 5;
    }
  }

  return score;
}

function getCombinations(
  values: string[],
  size: number
): string[][] {
  const result: string[][] = [];

  function combine(
    start: number,
    current: string[]
  ) {
    if (current.length === size) {
      result.push([...current]);
      return;
    }

    for (
      let i = start;
      i < values.length;
      i++
    ) {
      current.push(values[i]);

      combine(i + 1, current);

      current.pop();
    }
  }

  combine(0, []);

  return result;
}

export default detectStructure;