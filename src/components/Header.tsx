// src/components/Header.tsx

"use client";

import { Gem, ChevronDown, Coins } from "lucide-react";
type Theme = "white" | "blue" | "dark";

interface HeaderProps {
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export default function Header({ theme, onThemeChange }: HeaderProps) {
  const themeOptions: { id: Theme; label: string; icon: string }[] = [
    { id: "white", label: "Light", icon: "🌤" },
    { id: "blue", label: "Calm", icon: "🔵" },
    { id: "dark", label: "Dark", icon: "🌙" },
  ];

  return (
    <header className="border-b border-secondary bg-secondary/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-gold p-2 rounded-lg shadow-gold">
              <Coins className="w-6 h-6 text-white" />
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

          <div className="flex items-center gap-4">
            <div className="relative flex items-center gap-2 bg-secondary border-2 border-secondary rounded-full px-4 py-2 shadow-md hover:shadow-lg hover:border-gold-400 transition-all duration-200 cursor-pointer group">
              <span className="text-xs text-secondary hidden sm:inline font-bold uppercase tracking-wide">
                Theme
              </span>
              <select
                value={theme}
                onChange={(e) => onThemeChange(e.target.value as Theme)}
                className="bg-transparent text-primary text-sm font-bold focus:outline-none pr-7 appearance-none cursor-pointer min-w-20"
              >
                {themeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {`${option.icon} ${option.label}`}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-muted absolute right-3 pointer-events-none transition-transform group-hover:translate-y-0.5" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
