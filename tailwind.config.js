/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors');
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
      transparent: 'transparent',
      current: 'currentColor',
      black: '#000',
      white: '#fff',
      // primary: '#00FFE8',
      secondary: '#E48632',
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
      industrial: {
        50: '#fdf6ed',
        100: '#f8e5cd',
        200: '#f1c896',
        300: '#eaa75f',
        400: '#e48632',
        500: '#dd6a23',
        600: '#c34b1c',
        700: '#a3331a',
        800: '#85291b',
        900: '#6d231a',
        950: '#3e0f0a',
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
      uiBsecondary: {
        50: '#222',
        100: '#222',
        200: '#222',
        300: '#222',
        400: '#222',
        500: '#222',
        600: '#222',
        700: '#222',
        800: '#222',
        900: '#222',
        950: '#222',
      },
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
      yellow: {
        50: '#fdfde9',
        100: '#fdfbc4',
        200: '#fbf38d',
        300: '#f9e54b',
        400: '#f5d31a',
        500: '#f1c40f',
        600: '#c59009',
        700: '#9d670b',
        800: '#825211',
        900: '#6f4314',
        950: '#412307',
      },
      bprimary: '#111',
      bsecondary: '#222',
      btertiary: '#444',
      danger: '#dc2626',
      success: '#16a34a',
      tbase: '#d1d5dd',
      'light-gray': '#c7c7c7',
      'dark-gray': '#6f6f6f',
      green: {
        50: '#f0fdf5',
        100: '#dcfce8',
        200: '#bbf7d1',
        300: '#86efad',
        400: '#4ade81',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803c',
        800: '#166533',
        900: '#14532b',
        950: '#052e14',
      },
    },
    extend: {
      fontFamily: {
        nasa: ['nasalization', 'sans-serif'],
      },
      brightness: {
        85: '.85',
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
      keyframes: {
        zoom: {
          '0%': { opacity: 0, transform: 'scale(0.5)', transform: 'rotate(5deg)', animationTimingFunction: 'ease-in' },
          '85%': { opacity: 1 },
          '100%': { opacity: 0.2, transform: 'scale(2.2)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@headlessui/tailwindcss')({ prefix: 'ui' }),
    function ({ addUtilities }) {
      addUtilities({
        '.animate-link': {
          '@apply active:scale-95 [transition:_opacity_.5s_ease-in-out,filter_.2s_ease-in-out,transform_.05s_ease-in-out,outline_.2s_ease-in-out]':
            {},
        },
        '.transition-group': {
          '@apply transition-all duration-200 group-hover:duration-300': {},
        },
      });
    },
  ],
};
