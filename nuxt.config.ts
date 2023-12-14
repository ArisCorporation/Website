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
    },
  },
  css: ['~/assets/css/main.css', '~/assets/css/tailwind.css'],

  modules: [
    // '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxt/image',
    'nuxt-icon',
    'nuxt-headlessui',
    'nuxt-directus',
    '@nuxt/content',
    '@pinia/nuxt',
    '@vueuse/motion/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'dayjs-nuxt',
    '@nuxt/ui',
  ],

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    cmsToken: process.env.NUXT_CMS_TOKEN,
    public: {
      environment: process.env.NUXT_PUBLIC_ENVIRONMENT,
      url: process.env.NUXT_PUBLIC_URL,
      fileBase: process.env.NUXT_PUBLIC_FILE_BASE,
      motion: {
        directives: {
          'default-button': {
            initial: {
              scale: 1,
            },
            hovered: {
              scale: 1.1,
            },
            tapped: {
              scale: 0.97,
            },
          },
        },
      },
    },
  },

  components: [
    {
      path: '~/components',
      global: true,
    },
    {
      path: '~/components/global',
      prefix: '',
      global: true,
    },
  ],

  image: {
    provider: 'directus',
    directus: {
      baseURL: 'https://cms.ariscorp.de/assets/',
      modifiers: {
        format: 'webp',
      },
    },
  },

  piniaPersistedstate: {
    storage: 'localStorage',
  },

  directus: {
    url: 'https://cms.ariscorp.de',
  },

  headlessui: {
    prefix: 'Headless',
  },

  dayjs: {
    locales: ['en', 'de'],
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale: 'de',
    defaultTimezone: 'Europe/Berlin',
  },
});
