/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/index.ejs"],
  theme: {
    screens: {
      sm: '480px',
      md: '768px',
      lg: '976px',
      xl: '1440px'
    },
    extend: {
      // colors: {
      //   veryLightBlue: '#edf1ff',
      // },
    },
  },
  plugins: [],
}
