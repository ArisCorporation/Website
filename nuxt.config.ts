// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    apiKey: process.env.NUXT_API_KEY || 'default_fallback_key',
    apiSecret: process.env.NUXT_API_SECRET,

    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL || 'https://cms.ariscorp.de',
    }
  },

  extends: [
    './layers/ams', // AMS module
  ],

  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxt/test-utils',
    '@nuxt/ui',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@compodium/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  components: [
    // For All Components
    {
      path: '~/components',
      global: true,
    },
    // For Global-Components
    {
      path: '~/components/global',
      prefix: '',
      global: true,
    },
  ],

  image: {
    provider: 'directus',
    directus: {
      baseURL: process.env.NUXT_PUBLIC_FILE_BASE,
      modifiers: {
        format: 'webp',
      },
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-01',

})