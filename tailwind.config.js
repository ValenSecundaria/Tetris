/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      boxShadow: {
        neon: "0 0 10px rgba(255,255,255,0.6), 0 0 20px rgba(0,255,255,0.6)",
      },
    },
  },
  plugins: [],
};
