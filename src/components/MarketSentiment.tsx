// src/components/MarketSentiment.tsx

"use client";

import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";

interface MarketSentimentProps {
  priceChange: number;
  priceChangePercent: number;
  historicalData?: Array<{ date: string; price: number }>;
}

export default function MarketSentiment({
  priceChange,
  priceChangePercent,
  historicalData = [],
}: MarketSentimentProps) {
  // Calculate trend from historical data
  const calculateTrend = () => {
    if (!historicalData || historicalData.length < 2) {
      return 0;
    }

    const oldest = historicalData[0]?.price || 0;
    const newest = historicalData[historicalData.length - 1]?.price || 0;

    if (oldest === 0) return 0;
    return ((newest - oldest) / oldest) * 100;
  };

  const trendPercent = calculateTrend();

  // Combine 24h change and trend for more accurate sentiment
  const combinedChange = priceChangePercent * 0.3 + trendPercent * 0.7; // 30% weight on 24h, 70% on trend

  const getSentiment = () => {
    // Use combined change for more accurate sentiment
    const changeToUse =
      combinedChange !== 0 ? combinedChange : priceChangePercent;

    if (changeToUse > 2) {
      return {
        label: "Strong Bullish",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-300",
        icon: TrendingUp,
        description: "Strong upward momentum",
        gauge: 90,
      };
    } else if (changeToUse > 0.5) {
      return {
        label: "Bullish",
        color: "text-green-500",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: TrendingUp,
        description: "Positive price movement",
        gauge: 70,
      };
    } else if (changeToUse < -2) {
      return {
        label: "Strong Bearish",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-300",
        icon: TrendingDown,
        description: "Strong downward pressure",
        gauge: 10,
      };
    } else if (changeToUse < -0.5) {
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
          <div className="text-right">
            <span className={`text-xs font-semibold ${sentiment.color}`}>
              {trendPercent > 0 ? "+" : ""}
              {trendPercent.toFixed(2)}% (30d)
            </span>
            <br />
            <span
              className={`text-xs ${priceChangePercent > 0 ? "text-green-500" : priceChangePercent < 0 ? "text-red-500" : "text-gray-500"}`}
            >
              {priceChangePercent > 0 ? "+" : ""}
              {priceChangePercent.toFixed(2)}% (24h)
            </span>
          </div>
        </div>

        <p className={`text-xs mb-3 ${sentiment.color}`}>
          {sentiment.description}
        </p>

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
