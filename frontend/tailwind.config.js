/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0A1A33",
          deep: "#071227",
          light: "#142A4D",
        },
        gold: {
          DEFAULT: "#C9A227",
          light: "#E8C766",
          dim: "#9C7E1E",
        },
        cream: "#FAF8F1",
        ink: "#1C1F26",
        maroon: "#7A1F2B",
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Source Sans 3", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "navy-gradient": "linear-gradient(160deg, #0A1A33 0%, #071227 100%)",
      },
      boxShadow: {
        gold: "0 0 0 1px rgba(201,162,39,0.35)",
        card: "0 1px 3px rgba(10,26,51,0.08), 0 8px 24px rgba(10,26,51,0.06)",
      },
    },
  },
  plugins: [],
};
