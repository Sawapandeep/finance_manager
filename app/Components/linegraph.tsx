// @/app/Components/linegraph.tsx
'use client';

import React, { useEffect, useMemo, useRef } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { Transaction } from "@/types";

const Box3DBar = (props: any) => {
  const { fill, x, y, width, height } = props;

  const depth = 6;

  return (
    <g>
      {/* Front */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={2}
        fill={fill}
        filter={
          fill === "#22c55e"
            ? "url(#greenShadow)"
            : "url(#redShadow)"
        }
      />

      {/* Right Side */}
      <polygon
        points={`
          ${x + width},${y}
          ${x + width + depth},${y - depth}
          ${x + width + depth},${y + height - depth}
          ${x + width},${y + height}
        `}
        fill="rgba(0,0,0,0.28)"
      />

      {/* Top */}
      <polygon
        points={`
          ${x},${y}
          ${x + depth},${y - depth}
          ${x + width + depth},${y - depth}
          ${x + width},${y}
        `}
        fill="rgba(255,255,255,0.18)"
      />
    </g>
  );
};

export default function LineGraph({ rows }: { rows: Transaction[] }) {
  const monthly = rows.reduce((acc, r) => {
    const d = new Date(r.date);

    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;

    const label = d.toLocaleString("default", {
      month: "short",
      year: "2-digit",
    });

    if (!acc[key]) {
      acc[key] = {
        key,
        month: label,
        income: 0,
        expense: 0,
      };
    }

    if (r.inOut === "COME") {
      acc[key].income += r.amount;
    } else if (
      r.inOut === "GO" ||
      r.inOut === "SAVINGS-DEBIT"
    ) {
      acc[key].expense += r.amount;
    }

    return acc;
  }, {} as Record<string, any>);

  const data = Object.values(monthly)
  .sort((a: any, b: any) => a.key.localeCompare(b.key));

const scrollRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  if (scrollRef.current) {
    scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }
}, [data.length]);

const isMobile =
  typeof window !== "undefined" && window.innerWidth < 768;

const visibleMonths = isMobile ? 3 : 6;

const chartWidth = Math.max(
  data.length * 120,
  visibleMonths * 120
);

  if (data.length === 0) return null;

  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <p
        className="text-sm font-medium mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        Monthly Income vs Expense
      </p>
      <div className="flex">
  {/* Fixed Y Axis */}
  <div
    className="shrink-0"
    style={{
      width: 60,
      height: 280,
    }}
  >
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 25,
          right: 0,
          left: 0,
          bottom: 25,
        }}
      >
        <YAxis
          tickLine={false}
          axisLine={false}
          stroke="var(--text-muted)"
          width={60}
        />

        {/* Dummy hidden bars so Recharts computes the same scale */}
        <Bar dataKey="income" fill="transparent" />
        <Bar dataKey="expense" fill="transparent" />
      </BarChart>
    </ResponsiveContainer>
  </div>

  {/* Scrollable chart */}
  <div
    ref={scrollRef}
    className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide"
  >
    <div
      style={{
        width: chartWidth,
        height: 280,
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barCategoryGap="18%"
          barGap={8}
          margin={{
            top: 25,
            right: 15,
            left: 0,
            bottom: 5,
          }}
        >
          <defs>
            <filter
              id="greenShadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0"
                dy="5"
                stdDeviation="5"
                floodColor="#16a34a"
                floodOpacity="0.55"
              />
            </filter>

            <filter
              id="redShadow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feDropShadow
                dx="0"
                dy="5"
                stdDeviation="5"
                floodColor="#dc2626"
                floodOpacity="0.55"
              />
            </filter>
          </defs>

          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="var(--border)"
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            stroke="var(--text-muted)"
          />

          {/* Hide duplicate axis */}
          <YAxis hide />

          <Tooltip
            cursor={{ fill: "transparent" }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;

              const income =
                payload.find((p) => p.dataKey === "income")?.value ?? 0;

              const expense =
                payload.find((p) => p.dataKey === "expense")?.value ?? 0;

              return (
                <div
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border)",
                    borderRadius: 14,
                    padding: "12px 14px",
                    minWidth: 150,
                  }}
                >
                  <div
                    style={{
                      marginBottom: 8,
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {label}
                  </div>

                  <div
                    style={{
                      color: "#22c55e",
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    ● Income ₹{Number(income).toLocaleString()}
                  </div>

                  <div
                    style={{
                      color: "#ef4444",
                      fontWeight: 600,
                    }}
                  >
                    ● Expense ₹{Number(expense).toLocaleString()}
                  </div>
                </div>
              );
            }}
          />

          <Bar
            dataKey="income"
            fill="#22c55e"
            shape={<Box3DBar />}
            maxBarSize={34}
            name="Income"
          />

          <Bar
            dataKey="expense"
            fill="#ef4444"
            shape={<Box3DBar />}
            maxBarSize={34}
            name="Expense"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
</div>

      {/* <div
  ref={scrollRef}
  className="
    overflow-x-auto
    overflow-y-hidden
    scrollbar-hide
  "
>
  <div
    style={{
      width: chartWidth,
      minWidth: "100%",
      height: 280,
    }}
  >
    <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barCategoryGap="18%"
          barGap={8}
          margin={{
            top: 25,
            right: 15,
            left: -10,
            bottom: 5,
          }}
        >
       <defs>
  <filter id="greenShadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow
      dx="0"
      dy="5"
      stdDeviation="5"
      floodColor="#16a34a"
      floodOpacity="0.55"
    />
  </filter>

  <filter id="redShadow" x="-50%" y="-50%" width="200%" height="200%">
    <feDropShadow
      dx="0"
      dy="5"
      stdDeviation="5"
      floodColor="#dc2626"
      floodOpacity="0.55"
    />
  </filter>
</defs>

          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="var(--border)"
          />

          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            stroke="var(--text-muted)"
          />

          <YAxis
            tickLine={false}
            axisLine={false}
            stroke="var(--text-muted)"
          />

<Tooltip
  cursor={{ fill: "transparent" }}
  content={({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    const income =
      payload.find((p) => p.dataKey === "income")?.value ?? 0;

    const expense =
      payload.find((p) => p.dataKey === "expense")?.value ?? 0;

    return (
      <div
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "12px 14px",
          minWidth: 150,
        }}
      >
        <div
          style={{
            marginBottom: 8,
            fontWeight: 600,
            color: "white",
          }}
        >
          {label}
        </div>

        <div
          style={{
            color: "#22c55e",
            fontWeight: 600,
            marginBottom: 6,
          }}
        >
          ● Income &nbsp; ₹{Number(income).toLocaleString()}
        </div>

        <div
          style={{
            color: "#ef4444",
            fontWeight: 600,
          }}
        >
          ● Expense ₹{Number(expense).toLocaleString()}
        </div>
      </div>
    );
  }}
/>

          <Bar
            dataKey="income"
            fill="#22c55e"
            shape={<Box3DBar />}
            maxBarSize={34}
            name="Income"
          />

          <Bar
            dataKey="expense"
            fill="#ef4444"
            shape={<Box3DBar />}
            maxBarSize={34}
            name="Expense"
          />
        </BarChart>

      </ResponsiveContainer>
  </div>
</div> */}
    </div>
  );
}