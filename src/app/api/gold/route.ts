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
      if (!date) {
        return NextResponse.json(
          { success: false, error: "Date parameter is required" },
          { status: 400 },
        );
      }

      // Cache historical data with date in key
      const cacheKey = `gold_historical_${metal}_${currency}_${date}`;
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

      // Cache historical data for 30 days (never changes)
      cache.set(cacheKey, data, 30 * 24 * 60 * 60 * 1000);

      return NextResponse.json({
        success: true,
        data,
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
