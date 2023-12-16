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
        500: '#00ffe8',
        600: '#00b7ac',
        700: '#009189',
        800: '#00726e',
        900: '#045d5a',
        950: '#00393a',
      },
      'ui-bg': {
        50: '#f6f6f6',
        100: '#e7e7e7',
        200: '#d1d1d1',
        300: '#b0b0b0',
        400: '#888888',
        500: '#6d6d6d',
        600: '#5d5d5d',
        700: '#4f4f4f',
        800: '#454545',
        900: '#3d3d3d',
        950: '#222222',
      },
      // primary: '#00FFE8',
      secondary: '#E48632',
      bprimary: '#111',
      bsecondary: '#222',
      btertiary: '#444',
      danger: '#dc2626',
      success: '#16a34a',
      tbase: '#d1d5dd',
      'light-gray': '#c7c7c7',
      'dark-gray': '#6f6f6f',
      red: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d',
        950: '#450a0a',
      },
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
      extend: {
        backgroundImage: {
          'aris-hover': 'radial-gradient(50% 50% at 50% 50%, rgba(0, 255, 232, 0.60) 0%, rgba(17, 17, 17, 0.00) 100%)',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('@headlessui/tailwindcss')({ prefix: 'ui' })],
};
