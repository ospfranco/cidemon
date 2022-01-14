const colors = require('tailwindcss/colors');

module.exports = {
  purge: [],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {...colors},
      pass: {
        50: '#F0F9F8',
        100: '#E8F9FA',
        200: '#99F6E4',
        300: '#5EEAD4',
        400: '#2DD4BF',
        500: '#16BDCA',
        600: '#0891B2',
        700: '#0F766E',
        800: '#1E383C',
        900: '#1E3034',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
