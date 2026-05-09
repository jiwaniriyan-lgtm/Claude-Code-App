import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0d0d1a',
        bg2: '#13132a',
        bg3: '#1a1a35',
        card: '#181830',
        border: '#2a2a4a',
        purple: { DEFAULT: '#a855f7', deep: '#7c3aed', light: '#c084fc' },
        pink: '#ec4899',
        cyan: '#06b6d4',
        green: '#22c55e',
        yellow: '#eab308',
        muted: '#94a3b8',
        text: '#f1f5f9',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '14px',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #7c3aed, #a855f7)',
        'gradient-accent': 'linear-gradient(135deg, #7c3aed, #ec4899)',
        'gradient-text': 'linear-gradient(135deg, #a855f7, #ec4899)',
      },
      animation: {
        spin: 'spin 0.7s linear infinite',
        shimmer: 'shimmer 1.5s infinite',
        fadeIn: 'fadeIn 0.3s ease',
      },
      keyframes: {
        shimmer: { to: { backgroundPosition: '-200% 0' } },
        fadeIn: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};

export default config;
