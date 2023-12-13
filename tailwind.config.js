/** @type {import('tailwindcss').Config} */
const srcDir = '.';

export default {
  content: [
    `${srcDir}/components/**/*.{vue,js,ts}`,
    `${srcDir}/layouts/**/*.vue`,
    `${srcDir}/pages/**/*.vue`,
    `${srcDir}/composables/**/*.{js,ts}`,
    `${srcDir}/plugins/**/*.{js,ts}`,
    `${srcDir}/utils/**/*.{js,ts}`,
    `${srcDir}/App.{js,ts,vue}`,
    `${srcDir}/app.{js,ts,vue}`,
    `${srcDir}/Error.{js,ts,vue}`,
    `${srcDir}/error.{js,ts,vue}`,
    `${srcDir}/app.config.{js,ts}`,
  ],
  theme: {
    colors: {
      black: '#000',
      white: '#fff',
      transparent: 'transparent',
      aris: {
        50: '#edfffd',
        100: '#c0fffa',
        200: '#81fff7',
        300: '#3afff4',
        400: '#00ffe8',
        500: '#00e2cf',
        600: '#00b7ac',
        700: '#009189',
        800: '#00726e',
        900: '#045d5a',
        950: '#00393a',
      },
      primary: '#00FFE8',
      secondary: '#E48632',
      bprimary: '#111',
      bsecondary: '#222',
      btertiary: '#444',
      danger: '#dc2626',
      success: '#16a34a',
      tbase: '#d1d5dd',
      'light-gray': '#c7c7c7',
      'dark-gray': '#6f6f6f',
    },
    extend: {
      fontFamily: {
        nasa: ['nasalization', 'sans-serif'],
      },
      aspectRatio: {
        potrait: '270 / 320',
      },
      height: {
        '2px': '.125rem',
      },
      inset: {
        '2px': '.125rem',
      },
      padding: {
        '2px': '.125rem',
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@headlessui/tailwindcss')({ prefix: 'ui' })],
};
