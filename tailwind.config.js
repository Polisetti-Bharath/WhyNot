/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Space Grotesk', 'monospace'],
      },
      colors: {
        // Glass morphism effects
        glass: {
          100: 'rgba(255, 255, 255, 0.1)',
          200: 'rgba(255, 255, 255, 0.2)',
          300: 'rgba(255, 255, 255, 0.05)',
        },
        // Primary brand colors - rose, purple, indigo palette
        neon: {
          purple: '#bc13fe',
          pink: '#ff006e',
        },
        'dark-purple': {
          950: '#0a0012',
          900: '#1a0a2e',
          800: '#2a1a3e',
        },
        'purple-glow': {
          10: 'rgba(188, 19, 254, 0.1)',
          15: 'rgba(188, 19, 254, 0.15)',
          20: 'rgba(188, 19, 254, 0.2)',
          30: 'rgba(188, 19, 254, 0.3)',
        },
        // Extended palette for consistency
        brand: {
          rose: {
            400: '#fb7185',
            500: '#f43f5e',
            600: '#e11d48',
          },
          purple: {
            400: '#c084fc',
            500: '#a855f7',
            600: '#9333ea',
          },
          indigo: {
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
          }
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple': 'linear-gradient(135deg, #000000 0%, #0a0012 25%, #1a0a2e 50%, #0a0012 75%, #000000 100%)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  },
  plugins: [],
}
