/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a'
        },
        coach: {
          50: '#fffbeb',
          100: '#fef3c7',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706'
        },
        // Nuancier "papier / encre" (juillet 2026) : palette chaude, encre marine
        // et rouge stylo plutôt que les dégradés violets/indigo d'origine —
        // voir .claude/agents/design.md pour le détail du nuancier.
        ink: {
          50: '#f7f4ec',
          100: '#ede9de',
          200: '#e0dbcb',
          400: '#a39c89',
          500: '#837b68',
          600: '#665f4f',
          700: '#504a3d',
          800: '#423d34',
          900: '#3d3a35'
        },
        indigo: { DEFAULT: '#1b2a4a', soft: '#e8ebf1' },
        coral: { DEFAULT: '#c1666b', soft: '#f4e5e4' },
        amber: { DEFAULT: '#e8a94c', soft: '#faf0dc' },
        teal: { DEFAULT: '#5c7a67', soft: '#e8eee9' },
        sage: '#7c9885',
        sidebar: { 1: '#111b30', 2: '#1b2a4a', soft: '#9aa6b8', line: 'rgba(255,255,255,0.09)' },
        canvas: '#faf7f0'
      },
      fontFamily: {
        sans: ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
        hand: ['Caveat', 'cursive']
      },
      boxShadow: {
        soft: '0 2px 12px -2px rgba(15, 23, 42, 0.08)',
        card: '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)'
      }
    }
  },
  plugins: []
}
