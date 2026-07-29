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
        ink: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a'
        },
        // Palette du tableau de bord (sidebar + KPIs), distincte de brand/coach
        // utilisés par le scan et les fiches — voir .claude/agents/design.md
        indigo: { DEFAULT: '#3b2f80', soft: '#ece9fa' },
        coral: { DEFAULT: '#e63950', soft: '#fdeaed' },
        amber: { DEFAULT: '#f5a524', soft: '#fef3e2' },
        teal: { DEFAULT: '#0f9488', soft: '#e4f6f3' },
        sidebar: { 1: '#1c1440', 2: '#2c1f5e', soft: '#a79fd1', line: 'rgba(255,255,255,0.09)' },
        canvas: '#f6f5fb'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
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
