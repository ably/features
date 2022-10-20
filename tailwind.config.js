// eslint-disable-next-line import/no-extraneous-dependencies
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: ['./output/*.html'],
  theme: {
    extend: {},
  },
  plugins: [
    plugin(({ addUtilities: addAblyUtilities }) => {
      const newUtilities = {
        '.vertical-lr': {
          writingMode: 'vertical-lr',
        },
      };
      addAblyUtilities(newUtilities);
    }),
  ],
};
