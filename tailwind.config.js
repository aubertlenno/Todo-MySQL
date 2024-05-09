/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        todo: "#9DC08B",
        bodyBg: "#EDF1D6",
        textColor: "40513B",
      },

      spacing: {
        "2rem": "2rem",
        "3rem": "3rem",
      },

      fontSize: {
        2: "2rem",
      },
    },
  },
  plugins: [],
};

