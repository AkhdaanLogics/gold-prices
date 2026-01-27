import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: "#fffef0",
          100: "#fffbd6",
          200: "#fff5ad",
          300: "#ffed7a",
          400: "#ffd93d",
          500: "#ffc107",
          600: "#e6a800",
          700: "#c28800",
          800: "#9e6f00",
          900: "#7a5600",
        },
      },
      backgroundImage: {
        "gradient-gold": "linear-gradient(135deg, #ffd93d 0%, #e6a800 100%)",
        "gradient-gold-reverse":
          "linear-gradient(135deg, #e6a800 0%, #ffd93d 100%)",
      },
      boxShadow: {
        gold: "0 4px 14px 0 rgba(255, 193, 7, 0.39)",
        "gold-lg": "0 10px 40px 0 rgba(255, 193, 7, 0.5)",
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
