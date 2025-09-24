/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./index.html"
  ],
  theme: {
    extend: {
      fontFamily: {
        'suisse': ['SuisseIntl', 'sans-serif'],
      },
      spacing: {
        '6.5': '1.625rem',
      },
      // Thêm các custom theme khác nếu cần
    },
  },
  plugins: [],
}