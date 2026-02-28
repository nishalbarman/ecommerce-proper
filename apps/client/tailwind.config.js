import plugin from "tailwindcss/plugin";

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

  plugins: [
    require("@tailwindcss/typography"),
    plugin(function ({ matchUtilities }) {
      matchUtilities(
        {
          zoom: (value) => ({
            zoom: value,
          }),
        },
        {
          values: {
            50: "0.5",
            75: "0.75",
            90: "0.9",
            100: "1",
            110: "1.1",
            125: "1.25",
            150: "1.5",
          },
        },
      );
    }),
  ],
};
