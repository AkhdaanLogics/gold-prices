// src/app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import localFont from "next/font/local";

const inter = Inter({ subsets: ["latin"] });

const quicksand = localFont({
  src: [
    {
      path: "../../public/fonts/quicksand.ttf",
      weight: "300 900",
      style: "normal",
    },
  ],
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Gold Tracker - Real-time Gold Price Monitoring",
  description:
    "Track real-time gold prices with beautiful charts and analytics",
  keywords: [
    "gold price",
    "gold tracker",
    "precious metals",
    "XAU",
    "commodities",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={quicksand.className}>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
