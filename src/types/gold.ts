// src/types/gold.ts

export interface GoldPrice {
  price: number;
  currency: string;
  timestamp: number;
  metal: string;
  prev_close_price?: number;
  ch?: number;
  chp?: number;
}

export interface GoldAPIResponse {
  metal: string;
  currency: string;
  price: number;
  price_gram_24k: number;
  price_gram_22k: number;
  price_gram_21k: number;
  price_gram_20k: number;
  price_gram_18k: number;
  prev_close_price: number;
  ch: number;
  chp: number;
  ask: number;
  bid: number;
  timestamp: number;
}

export interface HistoricalPrice {
  date: string;
  price: number;
  change?: number;
}

export interface ChartData {
  date: string;
  price: number;
  label: string;
}

export type Currency = "USD" | "IDR" | "EUR" | "GBP";
export type Metal = "XAU" | "XAG" | "XPT" | "XPD";

export interface GoldSettings {
  currency: Currency;
  metal: Metal;
  unit: "oz" | "gram";
}
