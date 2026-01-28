// src/lib/goldapi.ts
// Using Alpha Vantage API - GOLD_SILVER_HISTORY endpoint for precious metals
// Free tier: 5 API calls per minute and 500 per day

import { GoldAPIResponse, Currency, Metal } from "@/types/gold";

const ALPHA_VANTAGE_API_BASE = "https://www.alphavantage.co/query";

interface AlphaVantageMetalData {
  nominal: string;
  data: Array<{
    date: string;
    price: string;
  }>;
}

export class GoldAPIClient {
  private apiKey: string;

  // Metal to Alpha Vantage symbol mapping
  private metalSymbolMap: { [key in Metal]: string } = {
    XAU: "GOLD",
    XAG: "SILVER",
    XPT: "PLATINUM",
    XPD: "PALLADIUM",
  };

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async fetchAPI(params: Record<string, string>): Promise<any> {
    const queryString = new URLSearchParams({
      ...params,
      apikey: this.apiKey,
    }).toString();

    const response = await fetch(`${ALPHA_VANTAGE_API_BASE}?${queryString}`, {
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(
        `Alpha Vantage API Error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Check for API error messages
    if (data.Note) {
      throw new Error(`Alpha Vantage API Rate Limit: ${data.Note}`);
    }
    if (data["Error Message"]) {
      throw new Error(`Alpha Vantage API Error: ${data["Error Message"]}`);
    }

    // Debug: Log response structure
    console.log(`[Alpha Vantage] Query: ${params.function}`, {
      symbol: params.symbol,
      hasData: !!data.data,
      dataLength: data.data?.length || 0,
      latestDate: data.data?.[0]?.date,
    });

    return data;
  }

  async getCurrentPrice(
    metal: Metal = "XAU",
    currency: Currency = "USD",
  ): Promise<GoldAPIResponse> {
    const symbol = this.metalSymbolMap[metal];

    const data = (await this.fetchAPI({
      function: "GOLD_SILVER_HISTORY",
      symbol: symbol,
      interval: "daily",
    })) as AlphaVantageMetalData;

    if (!data.data || data.data.length === 0) {
      throw new Error(`No data available for ${symbol}`);
    }

    if (data.data.length < 2) {
      throw new Error(
        `Insufficient data for ${symbol}. Need at least 2 days of data.`,
      );
    }

    // Get latest and previous day data
    const latestData = data.data[0];
    const previousData = data.data[1];

    console.log(
      `[Alpha Vantage] Latest data for ${symbol}: ${latestData.date}`,
    );

    // Prices from Alpha Vantage are in USD per troy ounce
    let price = parseFloat(latestData.price);
    const previousClose = parseFloat(previousData.price);
    const change = price - previousClose;
    const changePercent = (change / previousClose) * 100;

    // Convert currency if needed
    if (currency !== "USD") {
      const { convertPriceToCurrency } = await import("@/lib/utils");
      price = await convertPriceToCurrency(price, "USD", currency);
    }

    // Estimate bid/ask with spread
    const spread = price * 0.002; // 0.2% spread estimate

    return {
      metal,
      currency,
      price,
      price_gram_24k: price / 31.1035, // Convert oz to gram
      price_gram_22k: (price / 31.1035) * 0.9167,
      price_gram_21k: (price / 31.1035) * 0.875,
      price_gram_20k: (price / 31.1035) * 0.8333,
      price_gram_18k: (price / 31.1035) * 0.75,
      prev_close_price: previousClose,
      ch: change,
      chp: changePercent,
      ask: price + spread,
      bid: price - spread,
      timestamp: Math.floor(new Date(latestData.date).getTime()),
    };
  }

  async getHistoricalPrice(
    metal: Metal = "XAU",
    currency: Currency = "USD",
    date: string, // Format: YYYYMMDD
  ): Promise<any> {
    const symbol = this.metalSymbolMap[metal];

    const data = (await this.fetchAPI({
      function: "GOLD_SILVER_HISTORY",
      symbol: symbol,
      interval: "daily",
    })) as AlphaVantageMetalData;

    if (!data.data || data.data.length === 0) {
      throw new Error(`No historical data available for ${symbol}`);
    }

    // Format date from YYYYMMDD to YYYY-MM-DD
    const formattedDate = `${date.substring(0, 4)}-${date.substring(4, 6)}-${date.substring(6, 8)}`;

    console.log(
      `[Alpha Vantage] Looking for date ${formattedDate}, available dates: ${data.data
        .slice(0, 3)
        .map((d) => d.date)
        .join(", ")}...`,
    );

    // Find the data for the requested date
    let dateData = data.data.find((d) => d.date === formattedDate);

    // FALLBACK: If exact date not found, use the closest previous date
    if (!dateData) {
      console.log(
        `[Alpha Vantage] Exact date ${formattedDate} not found. Using fallback to closest available date.`,
      );

      const requestedTimestamp = new Date(formattedDate).getTime();

      // Find the closest date that is <= requested date
      dateData = data.data
        .filter((d) => new Date(d.date).getTime() <= requestedTimestamp)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0];

      // If still no data (requested date is before all available data), use the oldest available
      if (!dateData) {
        console.log(
          `[Alpha Vantage] No data before ${formattedDate}. Using oldest available date.`,
        );
        dateData = data.data[data.data.length - 1];
      }

      console.log(
        `[Alpha Vantage] Using data from ${dateData.date} instead of ${formattedDate}`,
      );
    }

    console.log(
      `[Alpha Vantage] Raw dateData:`,
      dateData,
      `close value: "${dateData.close}"`,
    );

    let price = parseFloat(dateData.close);

    console.log(
      `[Alpha Vantage] Parsed price from "${dateData.close}" = ${price}`,
    );

    // If price is NaN, log error and use current price as fallback
    if (isNaN(price)) {
      console.error(
        `[Alpha Vantage] Invalid price data for ${dateData.date}: "${dateData.close}"`,
      );
      // Try to get current price as fallback
      try {
        const currentPrice = await this.getCurrentPrice(metal, currency);
        price = currentPrice.price;
      } catch (error) {
        console.error(`[Alpha Vantage] Failed to get fallback price:`, error);
        price = 0; // Last resort
      }
    }

    // Convert currency if needed
    if (currency !== "USD" && price > 0) {
      const { convertPriceToCurrency } = await import("@/lib/utils");
      price = await convertPriceToCurrency(price, "USD", currency);
    }

    return {
      metal,
      currency,
      price,
      price_gram_24k: price / 31.1035,
      prev_close_price: price,
      ch: 0,
      chp: 0,
      timestamp: Math.floor(new Date(dateData.date).getTime()),
    };
  }

  async getHistoricalData(
    metal: Metal = "XAU",
    currency: Currency = "USD",
    days: number = 365,
  ): Promise<Array<{ date: string; price: number; timestamp: number }>> {
    const symbol = this.metalSymbolMap[metal];

    const data = (await this.fetchAPI({
      function: "GOLD_SILVER_HISTORY",
      symbol: symbol,
      interval: "daily",
    })) as AlphaVantageMetalData;

    if (!data.data || data.data.length === 0) {
      throw new Error(`No historical data available for ${symbol}`);
    }

    // Take the minimum of requested days or available data
    const availableDays = Math.min(days, data.data.length);
    console.log(
      `[Alpha Vantage] Requesting ${days} days, got ${data.data.length} days available. Using ${availableDays} days.`,
    );

    // Slice the requested number of days and convert price if needed
    const historicalData = data.data
      .slice(0, availableDays)
      .map(async (dayData) => {
        let price = parseFloat(dayData.price);

        // Convert currency if needed
        if (currency !== "USD") {
          const { convertPriceToCurrency } = await import("@/lib/utils");
          price = await convertPriceToCurrency(price, "USD", currency);
        }

        return {
          date: dayData.date,
          price,
          timestamp: new Date(dayData.date).getTime(),
        };
      });

    return Promise.all(historicalData).then(
      (results) => results.reverse(), // Sort ascending by date
    );
  }

  async getMultiCurrencyPrice(metal: Metal = "XAU"): Promise<any> {
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
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;

  if (!apiKey) {
    throw new Error("ALPHA_VANTAGE_API_KEY environment variable is not set");
  }

  return new GoldAPIClient(apiKey);
}
