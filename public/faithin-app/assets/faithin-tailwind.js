/* Faith In — Tailwind CDN configuration.
   Load immediately after the Tailwind CDN script, before <body> renders. */
tailwind.config = {
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Lora', 'Georgia', 'serif'],
        khmer: ['"Noto Serif Khmer"', 'Lora', 'serif']
      },
      colors: {
        surface:  'rgb(var(--surface) / <alpha-value>)',
        raised:   'rgb(var(--raised) / <alpha-value>)',
        canvas:   'rgb(var(--canvas) / <alpha-value>)',
        line:     'rgb(var(--line) / <alpha-value>)',
        ink:      'rgb(var(--ink) / <alpha-value>)',
        muted:    'rgb(var(--muted) / <alpha-value>)',
        faint:    'rgb(var(--faint) / <alpha-value>)',
        brand:    'rgb(var(--brand) / <alpha-value>)',
        'brand-strong': 'rgb(var(--brand-strong) / <alpha-value>)',
        'brand-soft':   'rgb(var(--brand-soft) / <alpha-value>)',
        gold:     'rgb(var(--gold) / <alpha-value>)',
        rose:     'rgb(var(--rose) / <alpha-value>)'
      },
      borderRadius: { card: '14px', pill: '999px' },
      boxShadow: {
        card: '0 1px 2px rgb(16 24 40 / .04), 0 1px 3px rgb(16 24 40 / .06)',
        lift: '0 4px 12px rgb(16 24 40 / .08), 0 12px 28px rgb(16 24 40 / .08)',
        pop:  '0 8px 24px rgb(16 24 40 / .12), 0 24px 60px rgb(16 24 40 / .16)'
      },
      keyframes: {
        'fade-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'none' } },
        'pop-in':  { '0%': { opacity: 0, transform: 'translateY(12px) scale(.98)' }, '100%': { opacity: 1, transform: 'none' } },
        heart:     { '0%': { transform: 'scale(1)' }, '45%': { transform: 'scale(1.35)' }, '100%': { transform: 'scale(1)' } }
      },
      animation: {
        'fade-up': 'fade-up .35s cubic-bezier(.22,1,.36,1) both',
        'pop-in': 'pop-in .22s cubic-bezier(.22,1,.36,1) both',
        heart: 'heart .4s ease'
      }
    }
  }
}
