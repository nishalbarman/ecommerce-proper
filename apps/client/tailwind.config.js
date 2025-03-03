/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: '"Andika", sans-serif',
        andika: "Andika, sans-serif", // Adds a new `font-andika` class
        marker: "'Permanent Marker', cursive",
        itim: "Itim, cursive",
        inconsolata: "Inconsolata, monospace",
      },
      colors: {
        primary: "#86cf9a", // Earth Green
        secondary: "#8D6E63", // Warm Brown
        accent: "#FFD700", // Gold
        maroon: "#800000", // Maroon
        cream: "#F5F5DC", // Cream
        orange: "#FFA500", // Orange
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
