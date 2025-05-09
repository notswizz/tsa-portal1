/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ec4899', // pink-500
          dark: '#be185d',    // pink-700
          light: '#f9a8d4',   // pink-300
        },
      },
    },
  },
  plugins: [],
} 