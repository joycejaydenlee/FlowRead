/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        warm: {
          50: "#FFF8F0",
          100: "#F5F5DC",
          200: "#E8DCC8",
          300: "#D2B48C",
          400: "#C4A882",
          500: "#A08060",
          600: "#5D4037",
          700: "#4E342E",
          800: "#3E2723",
          900: "#2C2C2C",
        },
      },
    },
  },
  plugins: [],
};
