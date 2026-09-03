"use client";

import { useMemo, useState, type JSX } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Sector,
  Cell,
  Tooltip,
  type SectorProps,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type PieDatum } from "../types";

export interface InteractivePieProps {
  data: PieDatum[];
  defaultCenterLabel?: string;
  colors?: string[];
  ariaLabel?: string;
  height?: number;
}

export function InteractivePie({
  data,
  defaultCenterLabel,
  colors,
  ariaLabel,
  height = 200,
}: InteractivePieProps): JSX.Element {
  const safeData = useMemo(() => data ?? [], [data]);
  const labels = useMemo(() => safeData.map((d) => d.name), [safeData]);
  const [activeName, setActiveName] = useState<string | undefined>(
    safeData[0]?.name
  );
  const activeIndex = useMemo(
    () => safeData.findIndex((d) => d.name === activeName),
    [safeData, activeName]
  );

  if (safeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-muted-foreground">
        Tidak ada data
      </div>
    );
  }

  const colorPalette = colors ?? [
    "#1A2A80",
    "#386641",
    "#0B57D0",
    "#B3261E",
    "#006875",
    "#7D5260",
  ];

  const renderActiveShape = (props: SectorProps): JSX.Element => {
    const { outerRadius = 0, ...rest } = props;
    return (
      <g>
        <Sector {...rest} outerRadius={outerRadius + 6} />
        <Sector
          {...rest}
          outerRadius={outerRadius + 16}
          innerRadius={outerRadius + 8}
          opacity={0.15}
        />
      </g>
    );
  };

  const active = safeData[activeIndex] ?? safeData[0];

  return (
    <div className="w-full">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-sm font-medium tracking-tight text-foreground/90">
          {defaultCenterLabel ?? "Chart"}
        </div>
        <div className="w-[160px]">
          <Select
            value={activeName}
            onValueChange={(v) => v && setActiveName(v)}
          >
            <SelectTrigger className="h-9 rounded-xl" aria-label={ariaLabel}>
              <SelectValue placeholder="Pilih" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-2xl">
              {labels.map((label) => {
                const idx = safeData.findIndex((d) => d.name === label);
                const color =
                  safeData[idx]?.color ??
                  colorPalette[idx % colorPalette.length];
                return (
                  <SelectItem
                    key={label}
                    value={label}
                    className="rounded-xl [&_span]:flex"
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <span
                        className="flex h-3 w-3 shrink-0 rounded"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate max-w-[10rem]">{label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              formatter={(val: unknown) =>
                typeof val === "number" ? val.toLocaleString() : String(val)
              }
            />
            <Pie
              data={safeData}
              dataKey="value"
              nameKey="name"
              innerRadius={height > 180 ? 40 : 30}
              outerRadius={height > 180 ? 72 : 50}
              activeShape={renderActiveShape}
              strokeWidth={4}
              paddingAngle={2}
              isAnimationActive
            >
              {safeData.map((entry, idx) => (
                <Cell
                  key={entry.name}
                  fill={entry.color ?? colorPalette[idx % colorPalette.length]}
                />
              ))}
            </Pie>

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-lg font-bold tracking-tight"
              style={{ pointerEvents: "none" }}
            >
              {typeof active?.value === "number"
                ? active.value.toLocaleString()
                : String(active?.value ?? "")}
            </text>

            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              dy={18}
              className="fill-muted-foreground text-xs"
              style={{ pointerEvents: "none" }}
            >
              {active?.name}
            </text>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
