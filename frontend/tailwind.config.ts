import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Inter',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        bg: {
          base: '#0a0a0f',
          raised: '#12121a',
          sunken: '#07070b',
        },
        line: {
          soft: 'rgba(255,255,255,0.06)',
          DEFAULT: 'rgba(255,255,255,0.10)',
          strong: 'rgba(255,255,255,0.18)',
        },
        text: {
          primary: '#f5f5f7',
          secondary: '#a1a1aa',
          muted: '#71717a',
        },
        brand: {
          50: '#eef2ff',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
        },
        trust: {
          safe: '#22c55e',
          caution: '#f59e0b',
          risk: '#ef4444',
        },
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px -10px rgba(0,0,0,0.6)',
        ring: '0 0 0 1px rgba(99,102,241,0.4), 0 0 30px -5px rgba(99,102,241,0.35)',
      },
      backgroundImage: {
        'hero-grad':
          'radial-gradient(120% 80% at 50% -10%, rgba(99,102,241,0.25) 0%, rgba(99,102,241,0) 55%), radial-gradient(80% 60% at 100% 0%, rgba(168,85,247,0.18) 0%, rgba(168,85,247,0) 50%)',
        'card-grad':
          'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
