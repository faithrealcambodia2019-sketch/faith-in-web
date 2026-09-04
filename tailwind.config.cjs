/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class"],
  theme: {
    extend: {
      colors: {
        // FaithIn's own blue, as a ramp. The marketing pages were written
        // against `gold-*`; new work should use `brand-*` so the accent
        // colour lives in one place.
        brand: {
          50: "#F7F9FE",
          100: "#E9EFFE",
          200: "#CBD8FA",
          300: "#A3B8F5",
          400: "#6D8AF0",
          500: "#2F5BEA",
          600: "#2549C9",
          700: "#1E40AF",
          800: "#1A3489",
          900: "#172B6B",
        },
        gold: {
          50: "#F7F9FE",
          100: "#E9EFFE",
          200: "#CBD8FA",
          300: "#A3B8F5",
          400: "#6D8AF0",
          500: "#2F5BEA",
          600: "#2549C9",
          700: "#1E40AF",
          800: "#1A3489",
          900: "#172B6B",
        },
        charcoal: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        alabaster: {
          50: "#FCFCFA",
          100: "#F6F5F0",
          200: "#EDEDE4",
          300: "#E0DED2",
          400: "#C8C5B5",
          500: "#A8A594",
        },
        serene: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          500: "#2563EB",
          600: "#1D4ED8",
        },
        sage: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          500: "#059669",
          600: "#047857",
        },
      },
    },
  },
  plugins: [],
};
