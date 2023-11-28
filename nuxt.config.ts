// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  css: ['~/assets/css/main.css', '~/assets/css/tailwind.css'],

  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxt/image',
    'nuxt-icons',
    'nuxt-icon',
    'nuxt-headlessui',
    'nuxt-directus',
    '@storybook-vue/nuxt-storybook',
  ],

  storybook: {
    url: 'http://localhost:3001',
    port: 3001,
  },

  directus: {
    url: 'https://cms.ariscorp.de',
  },
})
