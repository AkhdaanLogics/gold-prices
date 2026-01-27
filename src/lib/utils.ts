// src/lib/utils.ts

import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatCurrency(
  value: number,
  currency: string = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateMockHistoricalData(
  days: number = 30,
): Array<{ date: string; price: number }> {
  const data = [];
  const basePrice = 2050;
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const randomChange = (Math.random() - 0.5) * 40;
    const price =
      basePrice + randomChange + (Math.random() * 20 - 10) * (i / days);

    data.push({
      date: date.toISOString().split("T")[0],
      price: Math.round(price * 100) / 100,
    });
  }

  return data;
}

// Unit conversion constants (based on 1 troy ounce)
const UNIT_CONVERSIONS = {
  oz: 1, // troy ounce
  gram: 31.1035,
  kg: 0.0311035,
  tola: 2.6667, // Indian tola
  baht: 15.244, // Thai baht
};

export function convertPriceToUnit(
  pricePerOz: number,
  targetUnit: string,
): number {
  if (!UNIT_CONVERSIONS[targetUnit as keyof typeof UNIT_CONVERSIONS]) {
    throw new Error(`Unsupported unit: ${targetUnit}`);
  }
  return (
    pricePerOz / UNIT_CONVERSIONS[targetUnit as keyof typeof UNIT_CONVERSIONS]
  );
}

export async function convertPriceToCurrency(
  price: number,
  fromCurrency: string,
  toCurrency: string,
): Promise<number> {
  if (fromCurrency === toCurrency) return price;

  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch exchange rates");
    }

    const data = await response.json();
    const rate = data.rates[toCurrency];

    if (!rate) {
      throw new Error(`Exchange rate not found for ${toCurrency}`);
    }

    return price * rate;
  } catch (error) {
    console.error("Currency conversion error:", error);
    // Fallback: return original price if conversion fails
    return price;
  }
}

export function getUnitLabel(unit: string): string {
  const labels = {
    oz: "Troy Ounce",
    gram: "Gram",
    kg: "Kilogram",
    tola: "Tola",
    baht: "Baht",
  };
  return labels[unit as keyof typeof labels] || unit;
}
