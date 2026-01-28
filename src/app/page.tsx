// src/app/page.tsx

"use client";

import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import GoldPriceCard from "@/components/GoldPriceCard";
import GoldChart from "@/components/GoldChart";
import PriceHistory from "@/components/PriceHistory";
import GoldNews from "@/components/GoldNews";
import MarketSentiment from "@/components/MarketSentiment";
import FAQ from "@/components/FAQ";
import ContactEmail from "@/components/ContactEmail";
import {
  RefreshCw,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { GoldAPIResponse, Currency, Unit } from "@/types/gold";
import { getUnitLabel } from "@/lib/utils";

type Theme = "white" | "blue" | "dark";

export default function HomePage() {
  const [goldData, setGoldData] = useState<GoldAPIResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("USD");
  const [selectedUnit, setSelectedUnit] = useState<Unit>("oz");
  const [theme, setTheme] = useState<Theme>("blue");
  const [timeRange, setTimeRange] = useState<number>(30);
  const [historicalData, setHistoricalData] = useState<
    { date: string; price: number }[]
  >([]);
  const [loadingHistorical, setLoadingHistorical] = useState<boolean>(true);

  const fetchGoldPrice = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/gold?metal=XAU&currency=${selectedCurrency}&unit=${selectedUnit}&type=current`,
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

  const fetchHistoricalData = async () => {
    try {
      setLoadingHistorical(true);

      const response = await fetch(
        `/api/gold?metal=XAU&currency=${selectedCurrency}&unit=${selectedUnit}&type=historical-range&days=${timeRange}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Historical data response:", result);

      if (result.success && Array.isArray(result.data)) {
        console.log("Setting historical data:", result.data.length, "items");
        setHistoricalData(result.data);
      } else {
        throw new Error(result.error || "Failed to fetch historical data");
      }
    } catch (err: any) {
      console.error("Error fetching historical data:", err);
      setError(
        err.message || "Failed to load historical data. Please try again.",
      );
    } finally {
      setLoadingHistorical(false);
    }
  };

  useEffect(() => {
    fetchGoldPrice();
    fetchHistoricalData();

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
      fetchHistoricalData();

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
  }, [selectedCurrency, selectedUnit, timeRange]);

  useEffect(() => {
    const stored =
      typeof window !== "undefined" ? localStorage.getItem("gold-theme") : null;
    if (stored === "white" || stored === "blue" || stored === "dark") {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("theme-white", "theme-blue", "theme-dark");
    root.classList.add(`theme-${theme}`);
    localStorage.setItem("gold-theme", theme);
  }, [theme]);

  const chartData = useMemo(
    () =>
      historicalData.map((item) => ({
        date: item.date,
        price: item.price,
      })),
    [historicalData],
  );

  // Generate price history with changes
  const priceHistoryData = useMemo(
    () =>
      historicalData.map((item, index) => {
        const prevPrice =
          index > 0 ? historicalData[index - 1].price : item.price;
        const change = ((item.price - prevPrice) / prevPrice) * 100;
        return {
          ...item,
          change: index > 0 ? change : 0,
        };
      }),
    [historicalData],
  );

  return (
    <div className="min-h-screen">
      <Header theme={theme} onThemeChange={setTheme} />

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
            <h2 className="text-3xl font-bold text-primary">
              Gold Market Dashboard
            </h2>
            {lastUpdate ? (
              <p className="text-secondary mt-1">
                Last updated: {lastUpdate.toLocaleDateString("en-GB")} at{" "}
                {lastUpdate.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}{" "}
                (Jakarta GMT+7 - Daily refresh at midnight)
              </p>
            ) : (
              <p className="text-secondary mt-1">Loading data...</p>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="card-gold p-4 mb-6 border-l-4 border-l-gradient-gold">
          <p className="text-secondary text-sm leading-relaxed">
            Monitor real-time gold prices across multiple currencies and units.
            Data updates daily at midnight Jakarta time. Use the chart to track
            30-day trends, view recent price history, and make informed
            decisions with our market insights.
          </p>
        </div>

        {/* Settings */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary">Currency:</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
              className="bg-secondary border border-secondary rounded px-3 py-1 text-primary"
            >
              <option value="USD">USD</option>
              <option value="IDR">IDR</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="AUD">AUD</option>
              <option value="CAD">CAD</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary">Unit:</label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value as Unit)}
              className="bg-secondary border border-secondary rounded px-3 py-1 text-primary"
            >
              <option value="oz">Troy Ounce</option>
              <option value="gram">Gram</option>
              <option value="kg">Kilogram</option>
              <option value="tola">Tola</option>
              <option value="baht">Baht</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm text-secondary">Trend:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(parseInt(e.target.value))}
              className="bg-secondary border border-secondary rounded px-3 py-1 text-primary"
            >
              <option value="7">7 Days</option>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
            </select>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="xl:col-span-2 space-y-6">
            <div>
              {goldData ? (
                <GoldPriceCard
                  data={goldData}
                  loading={loading}
                  unit={selectedUnit}
                />
              ) : (
                <div className="card-gold p-6 animate-pulse">
                  <div className="h-32 bg-gold-200 rounded"></div>
                </div>
              )}
            </div>

            <div className="card-gold p-6">
              {loadingHistorical ? (
                <div className="h-64 animate-pulse bg-secondary rounded" />
              ) : historicalData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-muted">
                  <p>No historical data available</p>
                </div>
              ) : (
                <>
                  <GoldChart data={chartData} currency={selectedCurrency} />
                  <p className="text-xs text-muted mt-2">
                    {chartData.length} data points
                  </p>
                </>
              )}
            </div>

            <div className="card-gold p-6 flex flex-col">
              {loadingHistorical ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="h-6 bg-secondary animate-pulse rounded"
                    />
                  ))}
                </div>
              ) : (
                <PriceHistory
                  data={priceHistoryData}
                  currency={selectedCurrency}
                />
              )}
            </div>

            <FAQ />
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div className="card-gold p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-gradient-gold" />
                <h3 className="text-lg font-bold text-primary">Quick Stats</h3>
              </div>
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
                    {getUnitLabel(selectedUnit)}
                  </p>
                </div>
              </div>
            </div>

            <div className="card-gold p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-gradient-gold" />
                  <h3 className="text-sm font-bold text-primary">
                    Price Forecast
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary border border-secondary text-secondary">
                  Soon
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Advanced AI-powered forecasting tool to predict future gold
                prices based on historical trends, market patterns, and economic
                indicators. Get actionable insights to optimize your investment
                timing.
              </p>
            </div>

            <div className="card-gold p-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-gradient-gold" />
                <h3 className="text-sm font-bold text-primary">
                  Market Insights
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-gradient-gold text-xs">💡</span>
                  <p className="text-xs text-muted">
                    Gold typically rises during economic uncertainty
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gradient-gold text-xs">📊</span>
                  <p className="text-xs text-muted">
                    Monitor central bank policies for price trends
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-gradient-gold text-xs">⚡</span>
                  <p className="text-xs text-muted">
                    USD strength inversely affects gold prices
                  </p>
                </div>
              </div>
            </div>

            <MarketSentiment
              priceChange={goldData?.ch || 0}
              priceChangePercent={goldData?.chp || 0}
              historicalData={historicalData}
            />

            <GoldNews />

            <ContactEmail />
          </div>
        </div>

        {/* Mobile FAQ and Contact placement before footer */}
        <div className="mt-6 xl:hidden space-y-6">
          <FAQ />
          <ContactEmail />
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
