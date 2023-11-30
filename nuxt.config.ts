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
    'nuxt-icon',
    'nuxt-headlessui',
    'nuxt-directus',
    '@nuxt/content'
  ],

  runtimeConfig: {
    environment: '',
    authSecret: '',
    cmsToken: '',
    public: {
      url: '',
      apiBase: '',
      fileBase: '',
    },
  },
  
  directus: {
    url: 'https://cms.ariscorp.de',
  }
})
