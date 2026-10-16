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
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          500: '#f97316', // Orange ấm áp ẩm thực
          600: '#ea580c',
          700: '#c2410c',
        },
        food: {
          spicy: '#ef4444',
          sweet: '#ec4899',
          savory: '#eab308',
          healthy: '#10b981',
        }
      }
    },
  },
  plugins: [],
}
