import type { Row } from "./Row.type";

type ChartKind = "bar" | "line" | "area";
type Aggregation = "sum" | "average" | "count";

type ChartPoint = {
  label: string;
  value: number;
};

type ChartSectionProps = {
  data: Row[];
};

export type { ChartKind, Aggregation, ChartPoint, ChartSectionProps }