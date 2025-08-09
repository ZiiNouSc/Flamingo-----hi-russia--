/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        flamingo: {
          50: '#fef2f4',
          100: '#fde6ea',
          200: '#fbd0d9',
          300: '#f7a8b9',
          400: '#f56476',
          500: '#ea3654',
          600: '#d91b45',
          700: '#b31339',
          800: '#961336',
          900: '#801334',
          950: '#470618',
        },
        navy: {
          50: '#f5f6f8',
          100: '#ebedf1',
          200: '#d2d5e0',
          300: '#aab0c6',
          400: '#7c84a6',
          500: '#5c648b',
          600: '#484e72',
          700: '#3b405d',
          800: '#333750',
          900: '#2d3047',
          950: '#1a1c2a',
        },
        teal: {
          50: '#eefff9',
          100: '#c7fff0',
          200: '#91ffe2',
          300: '#58f9d4',
          400: '#41ead4',
          500: '#18ccb9',
          600: '#0aa39a',
          700: '#0a837c',
          800: '#0d6663',
          900: '#0f5453',
          950: '#003335',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};