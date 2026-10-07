type ColumnType = 
 | "text"
 | "number"
 | "date"
 | "boolean"
 | "mixed"
 | "unknown";

type ColumnInfo = {
    name: string;
    type: ColumnType;
    uniqueValues: number;
    emptyValues: number;
};

export type { ColumnInfo, ColumnType };