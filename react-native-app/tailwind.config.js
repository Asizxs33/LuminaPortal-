/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: { display: ['Georgia', 'Times New Roman', 'serif'] },
      colors: {
        academic: { 50: '#FAF0EF', 100: '#F4E6E6', 200: '#E7C9CB', 300: '#D5A3A9', 400: '#AE6671', 500: '#953344', 600: '#800F1D', 700: '#6B0E1B', 800: '#57101B', 900: '#40121B' },
        parchment: { 50: '#FCFAF6', 100: '#F3EDE4', 200: '#DFD2C3', 300: '#C9B8A5', 400: '#A29792', 500: '#756D70', 600: '#61565A', 700: '#46393D', 800: '#30272B', 900: '#10131B' },
      },
    },
  },
  plugins: [],
}

