/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        cciod: {
          white: {
            100: "#FDFDFD",
            200: "#f3f4f6",
            300: "#f8fafc",
          },
          black: {
            100: "#171717",
            200: "#18181b",
            300: "#09090b",
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
