/**
 * Tailwind configuration for the member interface under /public/faithin-app.
 *
 * The interface used to pull Tailwind from a CDN at runtime, configured by
 * `public/faithin-app/assets/faithin-tailwind.js`. The site's Content Security
 * Policy does not allow that CDN, so the stylesheet is compiled ahead of time
 * into `public/faithin-app/assets/faithin-tw.css` by `npm run build:app-css`.
 *
 * Keep the theme here in step with `assets/faithin-tailwind.js`, which remains
 * as the readable record of the design tokens. The colour values themselves
 * live in `assets/faithin.css` as CSS custom properties so both light and dark
 * themes work from one compiled utility set.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './public/faithin-app/**/*.html',
    './public/faithin-app/assets/**/*.js',
    // The legacy front-end scripts share this stylesheet too, so their
    // utility classes have to be scanned or they compile away.
    './public/assets/js/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        khmer: ['"Koh Santepheap"', '"Noto Serif Khmer"', 'serif'],
      },
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        raised: 'rgb(var(--raised) / <alpha-value>)',
        canvas: 'rgb(var(--canvas) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        ink: 'rgb(var(--ink) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        faint: 'rgb(var(--faint) / <alpha-value>)',
        brand: 'rgb(var(--brand) / <alpha-value>)',
        'brand-strong': 'rgb(var(--brand-strong) / <alpha-value>)',
        'brand-soft': 'rgb(var(--brand-soft) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        rose: 'rgb(var(--rose) / <alpha-value>)',
      },
      borderRadius: { card: '14px', pill: '999px' },
      boxShadow: {
        card: '0 1px 2px rgb(16 24 40 / .04), 0 1px 3px rgb(16 24 40 / .06)',
        lift: '0 4px 12px rgb(16 24 40 / .08), 0 12px 28px rgb(16 24 40 / .08)',
        pop: '0 8px 24px rgb(16 24 40 / .12), 0 24px 60px rgb(16 24 40 / .16)',
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
        'pop-in': { '0%': { opacity: 0, transform: 'translateY(12px) scale(.98)' }, '100%': { opacity: 1, transform: 'none' } },
        heart: { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.35)' }, '100%': { transform: 'scale(1)' } },
      },
      animation: {
        'fade-up': 'fade-up .35s cubic-bezier(.22,1,.36,1) both',
        'pop-in': 'pop-in .22s cubic-bezier(.22,1,.36,1) both',
        heart: 'heart .4s ease',
      },
    },
  },
  plugins: [],
};
