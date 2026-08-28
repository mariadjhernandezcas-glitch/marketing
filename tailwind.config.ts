import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./config/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: "#fafafa",
        surface: "#ffffff",
        border: {
          DEFAULT: "#e5e5e5",
          strong: "#d4d4d4",
        },
        ink: {
          DEFAULT: "#18181b",
          soft: "#52525b",
          faint: "#a1a1aa",
        },
        brand: {
          50: "#fef2f2",
          100: "#fee2e2",
          200: "#fecaca",
          300: "#fca5a5",
          400: "#f87171",
          500: "#e11d2e",
          600: "#c81525",
          700: "#a3121f",
          800: "#7f1119",
          900: "#450a0f",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        popover: "0 4px 16px -4px rgb(0 0 0 / 0.12)",
      },
      borderRadius: {
        lg: "10px",
        xl: "12px",
      },
    },
  },
  plugins: [],
};

export default config;
