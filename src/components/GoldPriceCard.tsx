// src/components/GoldPriceCard.tsx

"use client";

import { TrendingUp, TrendingDown, Clock, DollarSign } from "lucide-react";
import { formatCurrency, formatPercentage, formatDate } from "@/lib/utils";
import { GoldAPIResponse } from "@/types/gold";

interface GoldPriceCardProps {
  data: GoldAPIResponse;
  loading?: boolean;
}

export default function GoldPriceCard({ data, loading }: GoldPriceCardProps) {
  if (loading) {
    return (
      <div className="card-gold p-6 animate-pulse">
        <div className="h-8 bg-gold-200 rounded w-1/2 mb-4"></div>
        <div className="h-12 bg-gold-200 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gold-200 rounded w-1/3"></div>
      </div>
    );
  }

  const isPositive = data.ch >= 0;
  const priceChange = data.ch || 0;
  const priceChangePercent = data.chp || 0;

  return (
    <div className="card-gold p-6 gold-shimmer">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Current Gold Price</p>
          <h2 className="text-4xl font-bold text-gradient-gold">
            {formatCurrency(data.price, data.currency)}
          </h2>
          <p className="text-xs text-muted mt-1">per troy ounce</p>
        </div>

        <div className="bg-gradient-gold p-3 rounded-lg shadow-gold">
          <DollarSign className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-secondary p-4 rounded-lg border border-secondary">
          <p className="text-xs text-secondary mb-1">24h Change</p>
          <div
            className={`flex items-center gap-1 ${isPositive ? "price-up" : "price-down"}`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-bold">
              {formatCurrency(Math.abs(priceChange), data.currency)}
            </span>
          </div>
        </div>

        <div className="bg-secondary p-4 rounded-lg border border-secondary">
          <p className="text-xs text-secondary mb-1">Percentage</p>
          <div
            className={`flex items-center gap-1 ${isPositive ? "price-up" : "price-down"}`}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-bold">
              {formatPercentage(priceChangePercent)}
            </span>
          </div>
        </div>
      </div>

      <div className="border-t border-gold-200 pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-secondary">Ask</p>
            <p className="font-semibold text-gradient-gold">
              {formatCurrency(data.ask, data.currency)}
            </p>
          </div>
          <div>
            <p className="text-secondary">Bid</p>
            <p className="font-semibold text-gradient-gold">
              {formatCurrency(data.bid, data.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <Clock className="w-3 h-3" />
        <span>Updated: {formatDate(data.timestamp)}</span>
      </div>
    </div>
  );
}
