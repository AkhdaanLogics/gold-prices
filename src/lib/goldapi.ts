// src/lib/goldapi.ts

import { GoldAPIResponse, Currency, Metal } from "@/types/gold";

const GOLD_API_BASE = "https://www.goldapi.io/api";

export class GoldAPIClient {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchAPI(endpoint: string): Promise<any> {
    const response = await fetch(`${GOLD_API_BASE}${endpoint}`, {
      headers: {
        "x-access-token": this.apiKey,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(
        `GoldAPI Error: ${response.status} ${response.statusText}`,
      );
    }

    return response.json();
  }

  async getCurrentPrice(
    metal: Metal = "XAU",
    currency: Currency = "USD",
  ): Promise<GoldAPIResponse> {
    return this.fetchAPI(`/${metal}/${currency}`);
  }

  async getHistoricalPrice(
    metal: Metal = "XAU",
    currency: Currency = "USD",
    date: string, // Format: YYYYMMDD
  ): Promise<GoldAPIResponse> {
    return this.fetchAPI(`/${metal}/${currency}/${date}`);
  }

  async getMultiCurrencyPrice(metal: Metal = "XAU"): Promise<any> {
    // Get prices in multiple currencies
    const currencies: Currency[] = ["USD", "EUR", "GBP"];
    const promises = currencies.map((currency) =>
      this.getCurrentPrice(metal, currency).catch(() => null),
    );

    const results = await Promise.all(promises);
    return results.filter(Boolean);
  }

  async getPriceWithConversion(
    metal: Metal = "XAU",
    baseCurrency: Currency = "USD",
    targetCurrency: Currency = "USD",
    unit: string = "oz",
  ): Promise<any> {
    const data = await this.getCurrentPrice(metal, baseCurrency);

    // Convert currency if needed
    let convertedPrice = data.price;
    let convertedAsk = data.ask;
    let convertedBid = data.bid;
    let convertedCh = data.ch;

    if (baseCurrency !== targetCurrency) {
      const { convertPriceToCurrency } = await import("@/lib/utils");
      convertedPrice = await convertPriceToCurrency(
        data.price,
        baseCurrency,
        targetCurrency,
      );
      convertedAsk = await convertPriceToCurrency(
        data.ask,
        baseCurrency,
        targetCurrency,
      );
      convertedBid = await convertPriceToCurrency(
        data.bid,
        baseCurrency,
        targetCurrency,
      );
      convertedCh = await convertPriceToCurrency(
        data.ch,
        baseCurrency,
        targetCurrency,
      );
    }

    // Convert unit if needed
    const { convertPriceToUnit } = await import("@/lib/utils");
    if (unit !== "oz") {
      convertedPrice = convertPriceToUnit(convertedPrice, unit);
      convertedAsk = convertPriceToUnit(convertedAsk, unit);
      convertedBid = convertPriceToUnit(convertedBid, unit);
      convertedCh = convertPriceToUnit(convertedCh, unit);
    }

    return {
      ...data,
      price: convertedPrice,
      ask: convertedAsk,
      bid: convertedBid,
      ch: convertedCh,
      currency: targetCurrency,
      unit,
    };
  }
}

// Export singleton instance for server-side
export function getGoldAPIClient() {
  const apiKey =
    process.env.GOLD_API_KEY || process.env.NEXT_PUBLIC_GOLD_API_KEY;

  if (!apiKey) {
    throw new Error("GOLD_API_KEY is not configured");
  }

  return new GoldAPIClient(apiKey);
}
