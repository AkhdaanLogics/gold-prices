// src/app/api/gold/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getGoldAPIClient } from "@/lib/goldapi";
import { Currency, Metal } from "@/types/gold";
import cache from "@/lib/cache";

export const runtime = "nodejs";
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metal = (searchParams.get("metal") || "XAU") as Metal;
    const currency = (searchParams.get("currency") || "USD") as Currency;
    const unit = searchParams.get("unit") || "oz";
    const type = searchParams.get("type") || "current";

    if (type === "current") {
      // Create cache key based on request parameters
      const cacheKey = `gold_${metal}_${currency}_${unit}`;

      // Check cache first
      const cachedData = cache.get(cacheKey);
      if (cachedData) {
        const cacheAge = cache.getAge(cacheKey);
        const timeUntilExpiry = cache.getTimeUntilExpiry(cacheKey);

        return NextResponse.json({
          success: true,
          data: cachedData,
          cached: true,
          cacheAge: Math.floor((cacheAge || 0) / 1000), // in seconds
          expiresIn: Math.floor((timeUntilExpiry || 0) / 1000), // in seconds
          timestamp: Date.now(),
        });
      }

      // If not in cache, fetch from API
      const client = getGoldAPIClient();
      const data = await client.getPriceWithConversion(
        metal,
        "USD",
        currency,
        unit,
      );

      // Cache for 24 hours (86400000 ms)
      cache.set(cacheKey, data, 24 * 60 * 60 * 1000);

      return NextResponse.json({
        success: true,
        data,
        cached: false,
        timestamp: Date.now(),
      });
    }

    if (type === "historical") {
      const date = searchParams.get("date");
      const unit = searchParams.get("unit") || "oz";

      if (!date) {
        return NextResponse.json(
          { success: false, error: "Date parameter is required" },
          { status: 400 },
        );
      }

      // Cache historical data with date in key
      const cacheKey = `gold_historical_${metal}_${currency}_${unit}_${date}`;
      const cachedData = cache.get(cacheKey);

      if (cachedData) {
        return NextResponse.json({
          success: true,
          data: cachedData,
          cached: true,
          timestamp: Date.now(),
        });
      }

      const client = getGoldAPIClient();
      const data = await client.getHistoricalPrice(metal, currency, date);

      const { convertPriceToUnit } = await import("@/lib/utils");
      const convertedPrice =
        unit !== "oz" ? convertPriceToUnit(data.price, unit) : data.price;

      const response = {
        ...data,
        price: convertedPrice,
        unit,
      };

      // Cache historical data for 30 days (never changes)
      cache.set(cacheKey, response, 30 * 24 * 60 * 60 * 1000);

      return NextResponse.json({
        success: true,
        data: response,
        cached: false,
        timestamp: Date.now(),
      });
    }

    if (type === "historical-range") {
      const unit = searchParams.get("unit") || "oz";
      const daysParam = searchParams.get("days");
      const days = Math.min(
        Math.max(parseInt(daysParam || "30", 10) || 30, 1),
        60,
      );

      const cacheKey = `gold_hist_range_${metal}_${currency}_${unit}_${days}`;
      const cachedSeries = cache.get(cacheKey);
      if (cachedSeries) {
        return NextResponse.json({
          success: true,
          data: cachedSeries,
          cached: true,
          timestamp: Date.now(),
        });
      }

      const client = getGoldAPIClient();
      const { convertPriceToUnit, convertPriceToCurrency } =
        await import("@/lib/utils");

      // Build date list for past N days (most recent first)
      const dates: string[] = [];
      const today = new Date();
      for (let i = 0; i < days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const y = d.getFullYear();
        const m = `${d.getMonth() + 1}`.padStart(2, "0");
        const day = `${d.getDate()}`.padStart(2, "0");
        dates.push(`${y}${m}${day}`);
      }

      const series = [] as { date: string; price: number }[];
      for (const date of dates) {
        const singleCacheKey = `gold_historical_${metal}_${currency}_${unit}_${date}`;
        const cachedDay = cache.get(singleCacheKey) as any;
        if (cachedDay) {
          series.push({
            date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
            price: cachedDay.price,
          });
          continue;
        }

        // Fetch in USD first
        const data: any = await client.getHistoricalPrice(metal, "USD", date);

        // Convert currency if needed
        let convertedPrice = data.price;
        if (currency !== "USD") {
          convertedPrice = await convertPriceToCurrency(
            data.price,
            "USD",
            currency,
          );
        }

        // Convert unit if needed
        if (unit !== "oz") {
          convertedPrice = convertPriceToUnit(convertedPrice, unit);
        }

        cache.set(
          singleCacheKey,
          { ...data, price: convertedPrice, currency, unit },
          30 * 24 * 60 * 60 * 1000,
        );

        series.push({
          date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
          price: convertedPrice,
        });
      }

      // cache whole series for quick reuse
      cache.set(cacheKey, series, 24 * 60 * 60 * 1000); // refresh daily

      return NextResponse.json({
        success: true,
        data: series.reverse(), // oldest first for chart
        cached: false,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid type parameter" },
      { status: 400 },
    );
  } catch (error: any) {
    console.error("Gold API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch gold prices",
        timestamp: Date.now(),
      },
      { status: 500 },
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
