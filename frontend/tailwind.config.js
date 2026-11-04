/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        oxblood: {
          950: "#1A090B",
          900: "#2E1013",
          800: "#3D1519",
          700: "#4A1C20",
          600: "#5C2227",
        },
        henna: {
          700: "#55231D",
          600: "#6B2F27",
          500: "#843C32",
        },
        olive: {
          800: "#2C2E16",
          700: "#3F4220",
          500: "#5E6330",
          400: "#7B8140",
        },
        copper: {
          600: "#94532B",
          500: "#B0673A",
          400: "#C77A4A",
        },
        gold: {
          500: "#B58F3B",
          400: "#C8A24A",
          300: "#DAB866",
          200: "#ECD399",
        },
        emerald: {
          950: "#082421",
          900: "#0F3B36",
        },
        cream: {
          50: "#FBF8F0",
          100: "#F6EEDB",
          200: "#EDE0C4",
          300: "#E2D1AA",
        },
        parchment: {
          200: "#E5D8BC",
          300: "#D9C8A4",
          400: "#C5B188",
        }
      },
      fontFamily: {
        serif: ["Cormorant Garamond", "Playfair Display", "Georgia", "serif"],
        sans: ["Source Sans 3", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        indic: ["Noto Sans Devanagari", "Noto Sans Tamil", "Noto Sans Bengali", "sans-serif"]
      }
    },
  },
  plugins: [],
}

