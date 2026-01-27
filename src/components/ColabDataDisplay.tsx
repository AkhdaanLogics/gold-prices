// src/components/ColabDataDisplay.tsx

"use client";

import { useState, useEffect } from "react";
import { Database, TrendingUp, BarChart3, Activity } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ColabData {
  current_price?: any;
  historical_data?: any[];
  summary?: {
    average_price: number;
    min_price: number;
    max_price: number;
    volatility: number;
    total_change: number;
    total_pct_change: number;
  };
  generated_at?: string;
}

export default function ColabDataDisplay() {
  const [data, setData] = useState<ColabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColabData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/data/gold_data_export.json");

        if (!response.ok) {
          throw new Error("Failed to load Colab data");
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err: any) {
        console.error("Error loading Colab data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchColabData();
  }, []);

  if (loading) {
    return (
      <div className="card-gold p-6 animate-pulse">
        <div className="h-8 bg-gold-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-20 bg-gold-100 rounded"></div>
          <div className="h-20 bg-gold-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card-gold p-6 border-red-200">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <Database className="w-5 h-5" />
          <h3 className="font-bold">Colab Data Not Found</h3>
        </div>
        <p className="text-sm text-gray-600">
          {error ||
            "No data available. Make sure gold_data_export.json is in public/data/"}
        </p>
      </div>
    );
  }

  const { summary } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-gold p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-gold p-2 rounded-lg">
            <Database className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">
              Colab Analysis Data
            </h3>
            <p className="text-sm text-gray-600">Generated from Google Colab</p>
          </div>
        </div>

        {data.generated_at && (
          <p className="text-xs text-gray-500">
            Generated at: {new Date(data.generated_at).toLocaleString()}
          </p>
        )}
      </div>

      {/* Summary Statistics */}
      {summary && (
        <div className="card-gold p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-gold-500" />
            <h3 className="text-lg font-bold text-gray-800">
              Statistical Summary
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Average Price */}
            <div className="bg-gold-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Average Price</p>
              <p className="text-xl font-bold text-gold-700">
                {formatCurrency(summary.average_price, "USD")}
              </p>
            </div>

            {/* Min Price */}
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Minimum Price</p>
              <p className="text-xl font-bold text-red-700">
                {formatCurrency(summary.min_price, "USD")}
              </p>
            </div>

            {/* Max Price */}
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Maximum Price</p>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(summary.max_price, "USD")}
              </p>
            </div>

            {/* Volatility */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Volatility</p>
              <p className="text-xl font-bold text-blue-700">
                ${summary.volatility.toFixed(2)}
              </p>
            </div>

            {/* Total Change */}
            <div
              className={`p-4 rounded-lg ${
                summary.total_change >= 0 ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p className="text-xs text-gray-600 mb-1">Total Change</p>
              <p
                className={`text-xl font-bold ${
                  summary.total_change >= 0 ? "text-green-700" : "text-red-700"
                }`}
              >
                {summary.total_change >= 0 ? "+" : ""}
                {formatCurrency(summary.total_change, "USD")}
              </p>
            </div>

            {/* Total % Change */}
            <div
              className={`p-4 rounded-lg ${
                summary.total_pct_change >= 0 ? "bg-green-50" : "bg-red-50"
              }`}
            >
              <p className="text-xs text-gray-600 mb-1">Percentage Change</p>
              <p
                className={`text-xl font-bold ${
                  summary.total_pct_change >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {summary.total_pct_change >= 0 ? "+" : ""}
                {summary.total_pct_change.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Points Info */}
      {data.historical_data && (
        <div className="card-gold p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gold-500" />
            <h3 className="text-lg font-bold text-gray-800">
              Dataset Information
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gold-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Total Data Points</p>
              <p className="text-2xl font-bold text-gold-700">
                {data.historical_data.length}
              </p>
            </div>

            <div className="bg-gold-50 p-4 rounded-lg">
              <p className="text-xs text-gray-600 mb-1">Date Range</p>
              <p className="text-sm font-semibold text-gold-700">
                {data.historical_data.length > 0
                  ? `${data.historical_data.length} days`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>💡 Tip:</strong> This data was generated from your Google
          Colab analysis. To update, run the Colab notebook again and replace
          the JSON file in public/data/
        </p>
      </div>
    </div>
  );
}
