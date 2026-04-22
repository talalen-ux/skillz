import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: [
          'var(--font-display)',
          'var(--font-body)',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      colors: {
        // Warm dark surfaces
        bg: {
          DEFAULT: '#0A0A0C',
          raised: '#111113',
          elevated: '#16161A',
          sunken: '#070709',
        },
        line: {
          DEFAULT: '#1F1F22',
          strong: '#2A2A2E',
          soft: 'rgba(255,255,255,0.04)',
        },
        fg: {
          DEFAULT: '#FAFAF9',
          secondary: '#A8A29E',
          muted: '#78716C',
          dim: '#57534E',
        },
        // Burnished bronze/copper — brand accent
        accent: {
          DEFAULT: '#C68660',
          glow: '#D4A373',
          deep: '#8B5A3D',
          foreground: '#0A0A0C',
        },
        // Rating + highlight gold (distinct from accent)
        gold: '#F5B848',
        // Semantic trust colors — preserved, used only for safety signals
        trust: {
          safe: '#22c55e',
          caution: '#f59e0b',
          risk: '#ef4444',
        },
      },
      backgroundImage: {
        'accent-radial':
          'radial-gradient(90% 70% at 70% 40%, rgba(212,163,115,0.18) 0%, rgba(212,163,115,0) 55%)',
        'icon-tile':
          'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.01) 40%, rgba(0,0,0,0.3) 100%)',
      },
      letterSpacing: {
        eyebrow: '0.24em',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'orbit-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        'fade-in': 'fade-in 500ms ease-out both',
        'orbit-slow': 'orbit-slow 60s linear infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
