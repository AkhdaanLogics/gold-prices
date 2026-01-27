// src/components/GoldChart.tsx

"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ChartDataPoint {
  date: string;
  price: number;
}

interface GoldChartProps {
  data: ChartDataPoint[];
  currency?: string;
}

export default function GoldChart({ data, currency = "USD" }: GoldChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card-gold p-6">
        <div className="flex items-center justify-center h-64 text-muted">
          <p>No chart data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-gold p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-primary flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gradient-gold" />
            Price Trend
          </h3>
          <p className="text-sm text-secondary mt-1">Last 30 days</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ffd93d" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#ffd93d" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis
              tick={{ fill: "var(--text-muted)", fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value, currency)}
              domain={["dataMin - 20", "dataMax + 20"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--tooltip-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: "8px",
                boxShadow: "var(--card-shadow)",
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: "bold" }}
              formatter={(value: number | undefined) => [
                formatCurrency(value ?? 0, currency),
                "Price",
              ]}
              labelFormatter={(label) => {
                const date = new Date(label);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });
              }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#e6a800"
              strokeWidth={3}
              fill="url(#colorPrice)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
