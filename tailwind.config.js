/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cciod: {
          white: {
            100: "#FFFFFF",
            200: "#f5f5f5",
            300: "#FAFAFA",
          },
          black: {
            100: "#222222",
            200: "#1A1C1E",
            300: "#171717",
          },
        },
      },
      screens: {
        xs: "432px",
      },
    },
  },
  plugins: [],
};
