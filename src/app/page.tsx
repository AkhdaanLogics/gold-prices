// src/app/page.tsx

"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import GoldPriceCard from "@/components/GoldPriceCard";
import GoldChart from "@/components/GoldChart";
import PriceHistory from "@/components/PriceHistory";
import { RefreshCw, AlertCircle } from "lucide-react";
import { GoldAPIResponse } from "@/types/gold";
import { generateMockHistoricalData } from "@/lib/utils";

export default function HomePage() {
  const [goldData, setGoldData] = useState<GoldAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchGoldPrice = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "/api/gold?metal=XAU&currency=USD&type=current",
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setGoldData(result.data);
        setLastUpdate(new Date());
      } else {
        throw new Error(result.error || "Failed to fetch gold price");
      }
    } catch (err: any) {
      console.error("Error fetching gold price:", err);
      setError(err.message || "Failed to load gold prices. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoldPrice();

    // Calculate time until next midnight WIB (UTC+7)
    const getTimeUntilMidnightWIB = () => {
      const now = new Date();
      const nowUTC = now.getTime() + now.getTimezoneOffset() * 60000;
      const nowWIB = new Date(nowUTC + 7 * 3600000); // UTC+7

      const midnightWIB = new Date(nowWIB);
      midnightWIB.setHours(24, 0, 0, 0); // Next midnight

      return midnightWIB.getTime() - nowWIB.getTime();
    };

    // Set timeout for first daily refresh at midnight WIB
    const timeoutId = setTimeout(() => {
      fetchGoldPrice();

      // Then set up daily interval (24 hours)
      const intervalId = setInterval(
        () => {
          fetchGoldPrice();
        },
        24 * 60 * 60 * 1000,
      ); // 24 hours

      // Store interval ID for cleanup
      (window as any).__goldRefreshInterval = intervalId;
    }, getTimeUntilMidnightWIB());

    return () => {
      clearTimeout(timeoutId);
      if ((window as any).__goldRefreshInterval) {
        clearInterval((window as any).__goldRefreshInterval);
      }
    };
  }, []);

  // Generate mock historical data for chart
  const historicalData = generateMockHistoricalData(30);
  const chartData = historicalData.map((item) => ({
    date: item.date,
    price: item.price,
  }));

  // Generate price history with changes
  const priceHistoryData = historicalData.map((item, index) => {
    const prevPrice = index > 0 ? historicalData[index - 1].price : item.price;
    const change = ((item.price - prevPrice) / prevPrice) * 100;
    return {
      ...item,
      change: index > 0 ? change : 0,
    };
  });

  return (
    <div className="min-h-screen">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-300 font-semibold">Error loading data</p>
              <p className="text-red-400 text-sm mt-1">{error}</p>
              <button
                onClick={fetchGoldPrice}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Header Actions */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">
              Gold Market Dashboard
            </h2>
            <p className="text-secondary mt-1">
              Last updated: {lastUpdate.toLocaleDateString()} at{" "}
              {lastUpdate.toLocaleTimeString()} (Daily refresh at midnight WIB)
            </p>
          </div>

          <button
            onClick={fetchGoldPrice}
            disabled={loading}
            className="btn-gold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Price Card */}
          <div className="lg:col-span-2">
            {goldData ? (
              <GoldPriceCard data={goldData} loading={loading} />
            ) : (
              <div className="card-gold p-6 animate-pulse">
                <div className="h-32 bg-gold-200 rounded"></div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card-gold p-6">
            <h3 className="text-lg font-bold text-white mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="bg-secondary p-4 rounded-lg border border-secondary">
                <p className="text-sm text-secondary">Market</p>
                <p className="text-xl font-bold text-gradient-gold">
                  24/7 Trading
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg border border-secondary">
                <p className="text-sm text-secondary">Metal</p>
                <p className="text-xl font-bold text-gradient-gold">
                  Gold (XAU)
                </p>
              </div>
              <div className="bg-secondary p-4 rounded-lg border border-secondary">
                <p className="text-sm text-secondary">Unit</p>
                <p className="text-xl font-bold text-gradient-gold">
                  Troy Ounce
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <GoldChart data={chartData} currency="USD" />
        </div>

        {/* Price History */}
        <div>
          <PriceHistory data={priceHistoryData} currency="USD" />
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-4 bg-secondary rounded-lg border border-secondary">
          <div className="text-center text-sm text-secondary">
            <p className="mb-1">Data from GoldAPI.io</p>
            <p className="text-xs text-muted">
              Created by Akhdaan The Great © {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
