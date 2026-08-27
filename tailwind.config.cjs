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
        // Faith In member-app design tokens (see app/(faithin)/faithin-ui.css).
        // Names are new; the marketing gold/charcoal/serene/sage scales below
        // are untouched.
        surface: "rgb(var(--fim-surface) / <alpha-value>)",
        raised: "rgb(var(--fim-raised) / <alpha-value>)",
        canvas: "rgb(var(--fim-canvas) / <alpha-value>)",
        line: "rgb(var(--fim-line) / <alpha-value>)",
        ink: "rgb(var(--fim-ink) / <alpha-value>)",
        muted: "rgb(var(--fim-muted) / <alpha-value>)",
        faint: "rgb(var(--fim-faint) / <alpha-value>)",
        brand: "rgb(var(--fim-brand) / <alpha-value>)",
        "brand-strong": "rgb(var(--fim-brand-strong) / <alpha-value>)",
        "brand-soft": "rgb(var(--fim-brand-soft) / <alpha-value>)",
        gold: {
          50: "#FFFDF7",
          100: "#FEF7E6",
          200: "#FCE8BF",
          300: "#F9D68F",
          400: "#EBB94F",
          500: "#D9941E",
          600: "#B87814",
          700: "#8C580E",
          800: "#603A0A",
          900: "#362005",
        },
        charcoal: {
          50: "#F6F8FA",
          100: "#ECEFF3",
          200: "#D5DBE4",
          300: "#A8B4C5",
          400: "#6A7B95",
          500: "#445166",
          600: "#2B3444",
          700: "#1E2431",
          800: "#141822",
          900: "#0D1017",
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
