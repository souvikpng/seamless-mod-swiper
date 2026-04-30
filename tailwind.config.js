/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './services/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'cp-yellow': '#fcee0a',
        'cp-black': '#000000',
        'cp-red': '#ff003c',
        'cp-cyan': '#00e5ff',
        'cp-dark': '#0d0d0d',
        'cp-gray': '#2a2a2a',
      },
      fontFamily: {
        sans: ['Rajdhani', 'sans-serif'],
        mono: ['"Share Tech Mono"', 'monospace'],
      },
      animation: {
        'glitch-1': 'glitch-anim-1 2.5s infinite linear alternate-reverse',
        'glitch-2': 'glitch-anim-2 3s infinite linear alternate-reverse',
        scanline: 'scanline 8s linear infinite',
      },
      keyframes: {
        'glitch-anim-1': {
          '0%': { clipPath: 'inset(20% 0 80% 0)' },
          '20%': { clipPath: 'inset(60% 0 10% 0)' },
          '40%': { clipPath: 'inset(40% 0 50% 0)' },
          '60%': { clipPath: 'inset(80% 0 5% 0)' },
          '80%': { clipPath: 'inset(10% 0 70% 0)' },
          '100%': { clipPath: 'inset(30% 0 20% 0)' },
        },
        'glitch-anim-2': {
          '0%': { clipPath: 'inset(10% 0 60% 0)' },
          '20%': { clipPath: 'inset(30% 0 10% 0)' },
          '40%': { clipPath: 'inset(70% 0 20% 0)' },
          '60%': { clipPath: 'inset(20% 0 50% 0)' },
          '80%': { clipPath: 'inset(60% 0 10% 0)' },
          '100%': { clipPath: 'inset(40% 0 30% 0)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
};
