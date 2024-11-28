/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        bounceBeeLeft: {
          "0%, 100%": { transform: "translate(-50%, -60%)" },
          "50%": { transform: "translate(-50%, -40%)" },
        },
        bounceBeeRight: {
          "0%, 100%": { transform: "translate(50%, -60%)" },
          "50%": { transform: "translate(50%, -40%)" },
        },
      },
      animation: {
        bounceBeeLeft: "bounceBeeLeft 2s infinite ease-in-out",
        bounceBeeRight: "bounceBeeRight 2s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};
