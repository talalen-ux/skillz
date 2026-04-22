import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0b0c10',
        paper: '#fafafa',
        accent: '#6366f1',
      },
    },
  },
  plugins: [],
} satisfies Config;
