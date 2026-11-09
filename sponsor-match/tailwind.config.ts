import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f2f5fa",
          100: "#e3e9f4",
          200: "#c3d0e6",
          300: "#93a9cf",
          400: "#5d7cb2",
          500: "#3b5b96",
          600: "#2a467c",
          700: "#213865",
          800: "#1a2c50",
          900: "#12203d",
          950: "#0b1428",
        },
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          500: "#1f6feb",
          600: "#1559c9",
          700: "#1247a1",
        },
        accent: {
          50: "#fdeef0",
          100: "#fbd6db",
          500: "#d7263d",
          600: "#b81d31",
          700: "#93172a",
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', '"Hiragino Sans"', '"Hiragino Kaku Gothic ProN"', "Meiryo", "system-ui", "sans-serif"],
        display: ['"Zen Kaku Gothic New"', '"Noto Sans JP"', '"Hiragino Sans"', "Meiryo", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
