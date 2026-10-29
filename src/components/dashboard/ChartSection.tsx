
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BarChart3 } from "lucide-react";

import type { ChartKind, Aggregation, ChartPoint, ChartSectionProps } from "../../types";
import { formatNumber, parseNumericValue } from "../../services";


const ChartSection = ({ data }: ChartSectionProps) => {
  const columns = useMemo(
    () => Object.keys(data[0] ?? {}),
    [data],
  );

  const numericColumns = useMemo(() => {
    return columns.filter((column) => {
      const sample = data
        .slice(0, 500)
        .map((row) => row[column])
        .filter((value) => value !== null && value !== undefined && value !== "");

      if (sample.length === 0) return false;

      const numericCount = sample.filter(
        (value) => parseNumericValue(value) !== null,
      ).length;

      return numericCount / sample.length >= 0.7;
    });
  }, [columns, data]);

  const [xColumn, setXColumn] = useState("");
  const [yColumn, setYColumn] = useState("");
  const [aggregation, setAggregation] = useState<Aggregation>("sum");
  const [chartKind, setChartKind] = useState<ChartKind>("bar");

  useEffect(() => {
    if (!columns.includes(xColumn)) {
      setXColumn(columns[0] ?? "");
    }

    if (!numericColumns.includes(yColumn)) {
      setYColumn(numericColumns[0] ?? "");
    }
  }, [columns, numericColumns, xColumn, yColumn]);

  const chartData = useMemo<ChartPoint[]>(() => {
    if (!xColumn || data.length === 0) return [];

    const groups = new Map<
      string,
      { total: number; count: number; rows: number }
    >();

    for (const row of data) {
      const rawLabel = row[xColumn];
      const label =
        rawLabel === null || rawLabel === undefined || String(rawLabel).trim() === ""
          ? "(Sem valor)"
          : String(rawLabel);

      const group = groups.get(label) ?? {
        total: 0,
        count: 0,
        rows: 0,
      };

      group.rows += 1;

      if (aggregation !== "count" && yColumn) {
        const value = parseNumericValue(row[yColumn]);

        if (value !== null) {
          group.total += value;
          group.count += 1;
        }
      }

      groups.set(label, group);
    }

    return Array.from(groups.entries())
      .map(([label, group]) => {
        let value = group.rows;

        if (aggregation === "sum") {
          value = group.total;
        } else if (aggregation === "average") {
          value = group.count > 0 ? group.total / group.count : 0;
        }

        return { label, value };
      })
      .filter((point) => Number.isFinite(point.value))
      .sort((a, b) => {
        const yearA = Number(a.label);
        const yearB = Number(b.label);

        // Se ambos forem números, ordena em ordem crescente.
        if (Number.isFinite(yearA) && Number.isFinite(yearB)) {
          return yearA - yearB;
        }

        return a.label.localeCompare(b.label, "pt-BR", {
          numeric: true,
          sensitivity: "base",
        });
      })
      .slice(0, 20);
  }, [data, xColumn, yColumn, aggregation]);

  const canCalculate = aggregation === "count" || Boolean(yColumn);

  const commonChartProps = {
    data: chartData,
    margin: { top: 12, right: 12, left: 8, bottom: 48 },
  };

  return (
    <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-violet-100 p-3 text-violet-700">
          <BarChart3 size={22} />
        </div>

        <div>
          <h2 className="text-xl font-semibold text-slate-900">
            Visualização dos dados
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Escolha as colunas e a operação para explorar seus dados.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Agrupar por (eixo X)
          <select
            value={xColumn}
            onChange={(event) => setXColumn(event.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            {columns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Métrica (eixo Y)
          <select
            value={yColumn}
            onChange={(event) => setYColumn(event.target.value)}
            disabled={numericColumns.length === 0 || aggregation === "count"}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            {numericColumns.length === 0 && (
              <option value="">Nenhuma coluna numérica</option>
            )}
            {numericColumns.map((column) => (
              <option key={column} value={column}>
                {column}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Operação
          <select
            value={aggregation}
            onChange={(event) =>
              setAggregation(event.target.value as Aggregation)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            <option value="sum">Soma</option>
            <option value="average">Média</option>
            <option value="count">Contagem de registros</option>
          </select>
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Tipo de gráfico
          <select
            value={chartKind}
            onChange={(event) =>
              setChartKind(event.target.value as ChartKind)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          >
            <option value="bar">Barras</option>
            <option value="line">Linha</option>
            <option value="area">Área</option>
          </select>
        </label>
      </div>

      {numericColumns.length === 0 && aggregation !== "count" ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="font-medium text-slate-700">
            Não encontramos colunas numéricas suficientes para essa operação.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Você ainda pode selecionar “Contagem de registros” para visualizar
            quantos registros existem em cada categoria.
          </p>
        </div>
      ) : !canCalculate ? (
        <p className="text-sm text-slate-500">
          Selecione uma métrica numérica para gerar o gráfico.
        </p>
      ) : chartData.length === 0 ? (
        <p className="text-sm text-slate-500">
          Não há dados disponíveis para as opções selecionadas.
        </p>
      ) : (
        <>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartKind === "line" ? (
                <LineChart {...commonChartProps}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={75}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={formatNumber}
                    width={85}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => formatNumber(Number(value))}
                    labelStyle={{ color: "#0f172a" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name={
                      aggregation === "count"
                        ? "Registros"
                        : aggregation === "average"
                          ? "Média"
                          : "Soma"
                    }
                    stroke="#7c3aed"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              ) : chartKind === "area" ? (
                <AreaChart {...commonChartProps}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={75}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={formatNumber}
                    width={85}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => formatNumber(Number(value))}
                    labelStyle={{ color: "#0f172a" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name={
                      aggregation === "count"
                        ? "Registros"
                        : aggregation === "average"
                          ? "Média"
                          : "Soma"
                    }
                    stroke="#7c3aed"
                    fill="#c4b5fd"
                    fillOpacity={0.55}
                  />
                </AreaChart>
              ) : (
                <BarChart {...commonChartProps}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={75}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis
                    tickFormatter={formatNumber}
                    width={85}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(value) => formatNumber(Number(value))}
                    labelStyle={{ color: "#0f172a" }}
                  />
                  <Bar
                    dataKey="value"
                    name={
                      aggregation === "count"
                        ? "Registros"
                        : aggregation === "average"
                          ? "Média"
                          : "Soma"
                    }
                    fill="#7c3aed"
                    radius={[5, 5, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <p className="text-xs text-slate-500">
            Exibindo até 20 categorias, ordenadas pelo resultado da operação.
            {aggregation === "count"
              ? " A contagem considera todos os registros de cada categoria."
              : " A soma e a média consideram apenas os valores numéricos válidos."}
          </p>
        </>
      )}
    </section>
  );
}

export default ChartSection;