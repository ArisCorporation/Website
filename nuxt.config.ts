// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    }
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
    imageProvider: '',
    public: {
      url: '',
      apiBase: '',
      fileBase: '',
    },
  },

  image: {
    directus: {
      // This URL needs to include the final `assets/` directory
      baseURL: 'https://cms.ariscorp.de/assets/',
      modifiers: {
        format: 'webp'
      }
    }
  },

  headlessui: {
    prefix: 'Headless'
  },
  
  directus: {
    url: 'https://cms.ariscorp.de',
  }
})
