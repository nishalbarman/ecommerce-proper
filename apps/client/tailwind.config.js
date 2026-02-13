/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // "./app/**/*.{js,ts,jsx,tsx}",
    // "./pages/**/*.{js,ts,jsx,tsx}",
    // "./components/**/*.{js,ts,jsx,tsx}",
    // "./src/**/*.{js,ts,jsx,tsx,mdx}",

    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      animation: {
        flip: "flip 1.2s infinite linear",
        speeder: "speeder 0.4s linear infinite",
        speeder_slow: "speeder 1.3s linear infinite",
        fazer1: "fazer1 0.2s linear infinite",
        fazer2: "fazer2 0.4s linear infinite",
        fazer3: "fazer3 0.4s linear infinite",
        fazer4: "fazer4 1s linear infinite",
        lf: "lf 0.6s linear infinite",
        lf2: "lf2 0.8s linear infinite",
        lf3: "lf3 0.6s linear infinite",
        lf4: "lf4 0.5s linear infinite",
      },
      fontFamily: {
        sans: '"Andika", sans-serif',
        andika: "Andika, sans-serif", // Adds a new `font-andika` class
        marker: "'Permanent Marker', cursive",
        itim: "Itim, cursive",
        inconsolata: "Inconsolata, monospace",
      },
      colors: {
        // primary: "#86cf9a", // Earth Green
        primary: "#FFF", // Earth Green
        skeleton: "#c4deb8", // Light Green
        secondary: "#8D6E63", // Warm Brown
        accent: "#FFD700", // Gold
        maroon: "#800000", // Maroon
        cream: "#F5F5DC", // Cream
        orange: "#FFA500", // Orange
      },
      keyframes: {
        speeder: {
          "0%": { transform: "translate(2px, 1px) rotate(0deg)" },
          "10%": { transform: "translate(-1px, -3px) rotate(-1deg)" },
          "20%": { transform: "translate(-2px, 0px) rotate(1deg)" },
          "30%": { transform: "translate(1px, 2px) rotate(0deg)" },
          "40%": { transform: "translate(1px, -1px) rotate(1deg)" },
          "50%": { transform: "translate(-1px, 3px) rotate(-1deg)" },
          "60%": { transform: "translate(-1px, 1px) rotate(0deg)" },
          "70%": { transform: "translate(3px, 1px) rotate(-1deg)" },
          "80%": { transform: "translate(-2px, -1px) rotate(1deg)" },
          "90%": { transform: "translate(2px, 1px) rotate(0deg)" },
          "100%": { transform: "translate(1px, -2px) rotate(-1deg)" },
        },
        flip: {
          "0%": {
            transform: "perspective(600px) rotateY(0deg)",
          },
          "20%": {
            backgroundColor: "primary",
          },
          "29.9%": {
            backgroundColor: "primary",
          },
          "30%": {
            transform: "perspective(200px) rotateY(-90deg)",
            backgroundColor: "primary",
          },
          "54.999%": {
            opacity: "1",
          },
          "55%": {
            opacity: "0",
          },
          "60%": {
            transform: "perspective(200px) rotateY(-180deg)",
            backgroundColor: "primary",
          },
          "100%": {
            transform: "perspective(200px) rotateY(-180deg)",
            backgroundColor: "primary",
          },
        },
        fazer1: {
          "0%": { left: "0" },
          "100%": { left: "-80px", opacity: "0" },
        },
        fazer2: {
          "0%": { left: "0" },
          "100%": { left: "-100px", opacity: "0" },
        },
        fazer3: {
          "0%": { left: "0" },
          "100%": { left: "-50px", opacity: "0" },
        },
        fazer4: {
          "0%": { left: "0" },
          "100%": { left: "-150px", opacity: "0" },
        },
        lf: {
          "0%": { left: "200%" },
          "100%": { left: "-200%", opacity: "0" },
        },
        lf2: {
          "0%": { left: "200%" },
          "100%": { left: "-200%", opacity: "0" },
        },
        lf3: {
          "0%": { left: "200%" },
          "100%": { left: "-100%", opacity: "0" },
        },
        lf4: {
          "0%": { left: "200%" },
          "100%": { left: "-100%", opacity: "0" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
