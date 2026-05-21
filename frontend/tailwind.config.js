/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        surface: {
          light:   '#f8fafc',
          DEFAULT: '#ffffff',
          dark:    '#0f172a',
          darker:  '#020617',
        }
      },
      boxShadow: {
        'soft':  '0 1px 3px 0 rgba(0,0,0,0.06), 0 4px 16px -2px rgba(0,0,0,0.06)',
        'card':  '0 4px 24px -4px rgba(0,0,0,0.08), 0 1px 2px 0 rgba(0,0,0,0.04)',
        'glow':  '0 0 0 3px rgba(20,184,166,0.15), 0 0 20px rgba(20,184,166,0.25)',
        'brand': '0 4px 14px rgba(20,184,166,0.35)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in':    'fadeIn 0.4s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      }
    },
  },
  plugins: [],
}
