/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        soil: {
          900: "#1a1208",
          800: "#2d1f0e",
          700: "#3d2a12",
        },
        earth: {
          600: "#7a5c2e",
          500: "#a07840",
          400: "#c49a5a",
          300: "#dbb97a",
        },
        canopy: {
          700: "#1a3320",
          600: "#24472c",
          500: "#2d5c38",
          400: "#3d7a4a",
          300: "#52a362",
        },
        sky: {
          400: "#60a5d4",
          300: "#87bfe0",
          200: "#b8d9ef",
        },
        rain: "#3b82f6",
        sun: "#f59e0b",
        risk: {
          low: "#22c55e",
          medium: "#f59e0b",
          high: "#ef4444",
        },
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
