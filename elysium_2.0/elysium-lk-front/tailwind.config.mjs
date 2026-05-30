import { join } from "path";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: 'class',
  content: [
    join(__dirname, "src/**/*.{js,ts,jsx,tsx}"),
    join(__dirname, "src/app/**/*.{js,ts,jsx,tsx}"),
  ],
  theme: {
    extend: {
      colors: {
        blue: {
          950: '#0a0a23',
          900: '#1e293b',
          800: '#1e40af',
          600: '#2563eb',
          400: '#60a5fa',
        },
        purple: {
          950: '#2d0036',
          900: '#581c87',
          800: '#7c3aed',
          600: '#a21caf',
          400: '#c084fc',
        },
        pink: {
          600: '#db2777',
          500: '#ec4899',
          400: '#f472b6',
          300: '#f9a8d4',
        },
      },
      dropShadow: {
        glow: '0 0 8px #a21caf, 0 0 16px #2563eb',
      },
      animation: {
        'fade-in': 'fadeIn 1s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config; 