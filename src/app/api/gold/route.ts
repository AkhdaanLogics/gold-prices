// src/app/api/gold/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getGoldAPIClient } from "@/lib/goldapi";
import { Currency, Metal } from "@/types/gold";
import cache from "@/lib/cache";
import { convertPriceToUnit, convertPriceToCurrency } from "@/lib/utils";

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
        });
      }

      const client = getGoldAPIClient();

      // Use getHistoricalData to fetch all data in one API call
      const historicalDataList = await client.getHistoricalData(
        metal,
        "USD",
        days,
      );

      // Process data: convert currency and unit
      const seriesPromises = historicalDataList.map(async (item) => {
        let price = item.price;

        // Convert currency if needed
        if (currency !== "USD") {
          price = await convertPriceToCurrency(price, "USD", currency);
        }

        // Convert unit if needed
        if (unit !== "oz") {
          price = convertPriceToUnit(price, unit);
        }

        return {
          date: item.date,
          price,
        };
      });

      const series = await Promise.all(seriesPromises);

      // Cache the series
      cache.set(cacheKey, series, 24 * 60 * 60 * 1000); // refresh daily

      return NextResponse.json({
        success: true,
        data: series,
        cached: false,
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
