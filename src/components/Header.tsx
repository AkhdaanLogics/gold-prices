// src/components/Header.tsx

"use client";

import { Sparkles } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b border-secondary bg-secondary/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-gold p-2 rounded-lg shadow-gold">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient-gold">
                Gold Tracker
              </h1>
              <p className="text-sm text-secondary">
                Real-time gold price monitoring
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted">Powered by</p>
              <p className="text-sm font-semibold text-gradient-gold">
                GoldAPI.io
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
