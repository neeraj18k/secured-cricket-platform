/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cricket: { dark: "#0F172A", accent: "#00E0FF", success: "#00FF94" }
      }
    },
  },
  plugins: [],
}