/** @type {import('tailwindcss').Config} */
const srcDir = '.'

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
      primary: '#00FFE8',
      secondary: '#E48632',
      bprimary: '#111',
      bsecondary: '#222',
      danger: '#dc2626',
      agree: '#16a34a',
    },
    extend: {
      fontFamily: {
        nasa: ['nasalization', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
