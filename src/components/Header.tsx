// src/components/Header.tsx

"use client";

import { Sparkles } from "lucide-react";

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

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-secondary border border-secondary rounded-full px-3 py-1">
              <span className="text-xs text-secondary hidden sm:inline">
                Theme
              </span>
              <select
                value={theme}
                onChange={(e) => onThemeChange(e.target.value as Theme)}
                className="bg-transparent text-primary text-sm font-semibold focus:outline-none"
              >
                {themeOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {`${option.icon} ${option.label}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
