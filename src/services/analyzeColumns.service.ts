import type { Row } from "../types/Row.type";
import type {
  ColumnInfo,
  ColumnType,
} from "../types/ColumnInfo.type";

function detectColumnType(values: unknown[]): ColumnType {
  const nonEmptyValues = values.filter(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );

  if (nonEmptyValues.length === 0) {
    return "unknown";
  }

  const isBoolean = nonEmptyValues.every(
    (value) =>
      typeof value === "boolean" ||
      value === "true" ||
      value === "false"
  );

  if (isBoolean) {
    return "boolean";
  }

  const numericValues = nonEmptyValues.filter((value) => {
    if (typeof value === "number") {
      return !Number.isNaN(value);
    }

    if (typeof value === "string") {
      const normalizedValue = value
        .trim()
        .replace(",", ".");

      return (
        normalizedValue !== "" &&
        !Number.isNaN(Number(normalizedValue))
      );
    }

    return false;
  });

  const numericRatio =
    numericValues.length / nonEmptyValues.length;

  if (numericRatio >= 0.95) {
    return "number";
  }

  const isDate = nonEmptyValues.every((value) => {
    if (typeof value !== "string") {
      return false;
    }

    const date = new Date(value);

    return !Number.isNaN(date.getTime());
  });

  if (isDate) {
    return "date";
  }

  return "text";
}

function analyzeColumns(data: Row[]): ColumnInfo[] {
  if (data.length === 0) {
    return [];
  }

  const columnNames = Object.keys(data[0]);

  return columnNames.map((columnName) => {
    const values = data.map((row) => row[columnName]);

    const emptyValues = values.filter(
      (value) =>
        value === null ||
        value === undefined ||
        String(value).trim() === ""
    ).length;

    const uniqueValues = new Set(
      values
        .filter(
          (value) =>
            value !== null &&
            value !== undefined &&
            String(value).trim() !== ""
        )
        .map((value) => String(value))
    ).size;

    const type = detectColumnType(values);

    return {
      name: columnName,
      type,
      uniqueValues,
      emptyValues,
    };
  });
}

export default analyzeColumns;