// src/components/MarketSentiment.tsx

"use client";

import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface MarketSentimentProps {
  priceChange: number;
  priceChangePercent: number;
}

export default function MarketSentiment({
  priceChange,
  priceChangePercent,
}: MarketSentimentProps) {
  const getSentiment = () => {
    const absChange = Math.abs(priceChangePercent);

    if (priceChangePercent > 1.5) {
      return {
        label: "Strong Bullish",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-300",
        icon: TrendingUp,
        description: "Significant upward momentum",
        gauge: 90,
      };
    } else if (priceChangePercent > 0.5) {
      return {
        label: "Bullish",
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: TrendingUp,
        description: "Positive price movement",
        gauge: 70,
      };
    } else if (priceChangePercent < -1.5) {
      return {
        label: "Strong Bearish",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-300",
        icon: TrendingDown,
        description: "Significant downward pressure",
        gauge: 10,
      };
    } else if (priceChangePercent < -0.5) {
      return {
        label: "Bearish",
        color: "text-red-500",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: TrendingDown,
        description: "Negative price movement",
        gauge: 30,
      };
    } else {
      return {
        label: "Neutral",
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        icon: Minus,
        description: "Stable, no clear trend",
        gauge: 50,
      };
    }
  };

  const sentiment = getSentiment();
  const Icon = sentiment.icon;

  return (
    <div className="card-gold p-4">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-gradient-gold" />
        <h3 className="text-sm font-bold text-primary">Market Sentiment</h3>
      </div>

      <div
        className={`p-3 rounded-lg border ${sentiment.bgColor} ${sentiment.borderColor}`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${sentiment.color}`} />
            <span className={`text-sm font-bold ${sentiment.color}`}>
              {sentiment.label}
            </span>
          </div>
          <span className={`text-xs font-semibold ${sentiment.color}`}>
            {priceChangePercent > 0 ? "+" : ""}
            {priceChangePercent.toFixed(2)}%
          </span>
        </div>

        <p className={`text-xs mb-3 ${sentiment.color}`}>{sentiment.description}</p>

        {/* Sentiment Gauge */}
        <div className="relative">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                sentiment.gauge > 60
                  ? "bg-green-500"
                  : sentiment.gauge < 40
                    ? "bg-red-500"
                    : "bg-gray-400"
              }`}
              style={{ width: `${sentiment.gauge}%` }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs text-muted">
            <span>Bearish</span>
            <span>Neutral</span>
            <span>Bullish</span>
          </div>
        </div>
      </div>

      <div className="mt-3 p-2 bg-secondary rounded text-xs text-muted">
        <p className="mb-1">
          <strong className="text-primary">24h Change:</strong>{" "}
          <span
            className={priceChange >= 0 ? "text-green-600" : "text-red-600"}
          >
            {priceChange >= 0 ? "+" : ""}
            {priceChange.toFixed(2)}
          </span>
        </p>
        <p className="text-xs">
          Based on 24-hour price movement and volatility
        </p>
      </div>
    </div>
  );
}
