/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#1c1b18',
          espresso: '#23211d',
          gold: '#cda851',
          goldlight: '#dfc27d',
          terracotta: '#9e3322',
          surface: '#f9f8f5',
          card: '#ffffff',
          border: '#e6e2d8'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
