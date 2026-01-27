// src/app/api/gold/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getGoldAPIClient } from "@/lib/goldapi";
import { Currency, Metal } from "@/types/gold";

export const runtime = "edge";
export const revalidate = 3600; // Revalidate every hour

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const metal = (searchParams.get("metal") || "XAU") as Metal;
    const currency = (searchParams.get("currency") || "USD") as Currency;
    const type = searchParams.get("type") || "current";

    const client = getGoldAPIClient();

    if (type === "current") {
      const data = await client.getCurrentPrice(metal, currency);

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

      const data = await client.getHistoricalPrice(metal, currency, date);

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
