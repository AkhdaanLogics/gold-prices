// src/components/PriceHistory.tsx

"use client";

import { Clock, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface HistoricalDataPoint {
  date: string;
  price: number;
  change?: number;
}

interface PriceHistoryProps {
  data: HistoricalDataPoint[];
  currency?: string;
}

export default function PriceHistory({
  data,
  currency = "USD",
}: PriceHistoryProps) {
  if (!data || data.length === 0) {
    return (
      <div className="card-gold p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Price History</h3>
        <p className="text-gray-500 text-center py-8">
          No historical data available
        </p>
      </div>
    );
  }

  return (
    <div className="card-gold p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-gradient-gold" />
        <h3 className="text-xl font-bold text-white">Recent Prices</h3>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {data
          .slice(0, 10)
          .reverse()
          .map((item, index) => {
            const change = item.change || 0;
            const isPositive = change >= 0;
            const date = new Date(item.date);

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors border border-secondary"
              >
                <div>
                  <p className="font-semibold text-white">
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted">
                    {date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="text-right">
                  <p className="font-bold text-lg text-gradient-gold">
                    {formatCurrency(item.price, currency)}
                  </p>
                  {change !== 0 && (
                    <div
                      className={`flex items-center gap-1 justify-end text-sm ${
                        isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>
                        {isPositive ? "+" : ""}
                        {change.toFixed(2)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
