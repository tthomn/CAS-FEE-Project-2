/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E2B007', // Honey Gold
        secondary: '#FBEEC1', // Soft Yellow
        accent: '#2F1B0C', // Dark Brown
        neutral: '#F5F5F5', // Light Gray
      },
      fontFamily: {
        serif: ['Merriweather', 'serif'], // Use for titles
        sans: ['Inter', 'sans-serif'], // Use for body text
      },
    },
  },
  plugins: [],
};
