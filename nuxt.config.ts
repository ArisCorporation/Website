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

  image: {
    provider: 'directus',
    directus: {
      baseURL: process.env.NUXT_PUBLIC_FILE_BASE,
      modifiers: {
        format: 'webp',
      },
    },
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-01',

})