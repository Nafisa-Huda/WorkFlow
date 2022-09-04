/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
  "./views/index.ejs",
  "./*.html"
  ],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px'
    },
    extend: {
      height: {
        '140': '40rem',
      },
    },
  },
  plugins: [],
}
