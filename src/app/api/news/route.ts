// src/app/api/news/route.ts

import { NextResponse } from "next/server";
import cache from "@/lib/cache";

export async function GET() {
  try {
    const cacheKey = "gold_news";

    // Check cache first (1 hour TTL for news)
    const cachedNews = cache.get(cacheKey);
    if (cachedNews) {
      const cacheAge = cache.getAge(cacheKey);
      const timeUntilExpiry = cache.getTimeUntilExpiry(cacheKey);

      return NextResponse.json({
        success: true,
        articles: cachedNews,
        cached: true,
        cacheAge: Math.floor((cacheAge || 0) / 1000),
        expiresIn: Math.floor((timeUntilExpiry || 0) / 1000),
      });
    }

    const apiKey = process.env.GNEWS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key not configured" },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://gnews.io/api/v4/search?q=gold+price+market&lang=en&max=5&apikey=${apiKey}`,
    );

    if (!response.ok) {
      throw new Error(`GNews API error: ${response.status}`);
    }

    const data = await response.json();

    const articles =
      data.articles?.map((article: any) => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        description: article.description,
      })) || [];

    // Cache for 1 hour (3600000 ms)
    cache.set(cacheKey, articles, 60 * 60 * 1000);

    return NextResponse.json({
      success: true,
      articles,
      cached: false,
    });
  } catch (error: any) {
    console.error("Error fetching news:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch news",
      },
      { status: 500 },
    );
  }
}
