// src/components/FAQ.tsx

"use client";

import { useState } from "react";
import { HelpCircle, ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const ITEMS: FAQItem[] = [
  {
    question: "What is Gold (XAU)?",
    answer:
      "XAU is the international code for gold. This dashboard shows real-time prices and simple visuals to track gold movements.",
  },
  {
    question: "How stable is gold?",
    answer:
      "Gold is historically less volatile than many risk assets. It tends to hold value during market stress and currency swings, though it can still move with macro events.",
  },
  {
    question: "Why choose gold?",
    answer:
      "Gold is a global hedge against inflation, currency debasement, and geopolitical risk. It is liquid, recognized worldwide, and diversifies portfolios.",
  },
  {
    question: "Where does the data come from?",
    answer:
      "Price data comes from GoldAPI.io. News is fetched through the GNews API via a server-side endpoint to keep API keys secure.",
  },
  {
    question: "When is the data updated?",
    answer:
      "Prices refresh daily at midnight Jakarta time (UTC+7). You can also use the Refresh button anytime for a manual update.",
  },
  {
    question: "What drives gold prices?",
    answer:
      "Key drivers include USD strength, real interest rates, inflation expectations, central bank policy, geopolitical tension, and physical demand (jewelry/industry).",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="card-gold p-4">
      <div className="flex items-center gap-2 mb-3">
        <HelpCircle className="w-4 h-4 text-gradient-gold" />
        <h3 className="text-sm font-bold text-primary">FAQ</h3>
      </div>

      <div className="space-y-2">
        {ITEMS.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={index}
              className="rounded-lg border border-secondary overflow-hidden"
            >
              <button
                type="button"
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-3 py-2 bg-secondary text-left"
              >
                <span className="text-xs font-semibold text-primary">
                  {item.question}
                </span>
                {isOpen ? (
                  <ChevronUp className="w-3 h-3 text-muted" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-muted" />
                )}
              </button>
              {isOpen && (
                <div className="px-3 py-2 bg-secondary/70">
                  <p className="text-xs text-secondary leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
