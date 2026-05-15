/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./layout/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    screens: {
      xs: "425px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1284px",
      "2xl": "1536px",
      "3xl": "1654px",
    },
    container: {
      padding: {
        DEFAULT: "1rem",
        sm: "1rem",
        lg: "6.25vw",
        xl: "6.25vw",
        "2xl": "6.25vw",
        "3xl": "4.25vw",
      },
    },
    fontFamily: {
      montserrat: ["Montserrat", "sans-serif"],
      tartuffo: ['"Tartuffo Trial"', '"Cormorant Garamond"', '"Playfair Display"', "serif"],
      beautique: ['"Beautique Display"', '"Big Shoulders Display"', '"Oswald"', "sans-serif"],
      outfit: ["Outfit", "Montserrat", "sans-serif"],
    },
    extend: {
      colors: {
        mh: {
          dark: "#2a2828",
          red: "#ef493d",
          gold: "#c39a3e",
          grey: "#6d6d6d",
          ink: "#333333",
          muted: "#555555",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.65, 0, 0.35, 1)",
        premium: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
