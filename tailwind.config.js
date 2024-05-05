/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  "darkMode": "class",
  theme: {
    extend: {
      colors: {
        cciod: {
          white: {
            100: "#FDFDFD",
            200:"#F5F5F5"
          },
          black: {
            100: "#373d42",
            200: "#24292E",
            300:"#121519"
          },
        }
      }
    },
  },
  plugins: [],
}