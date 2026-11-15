/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F97316',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        chai: {
          dark: '#3B2418',
          medium: '#6B4226',
          light: '#A3683B',
          cream: '#FFF9F2',
          warm: '#FBF3EA',
          border: '#EAD7C5',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', 'sans-serif']
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(59, 36, 24, 0.08)',
        'float': '0 10px 25px -5px rgba(249, 115, 22, 0.3)',
      }
    },
  },
  plugins: [],
}
