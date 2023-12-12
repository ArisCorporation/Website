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
    '@nuxtjs/tailwindcss',
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
  ],

  runtimeConfig: {
    authSecret: '',
    cmsToken: '',
    imageProvider: '',
    public: {
      environment: '',
      url: '',
      apiBase: '',
      fileBase: '',
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
    directus: {
      // This URL needs to include the final `assets/` directory
      baseURL: process.env.NUXT_PUBLIC_FILE_BASE,
      modifiers: {
        format: 'webp',
      },
    },
  },

  headlessui: {
    prefix: 'Headless',
  },

  directus: {
    url: process.env.NUXT_PUBLIC_API_BASE,
  },

  dayjs: {
    locales: ['en', 'de'],
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale: 'de',
    defaultTimezone: 'Europe/Berlin',
  },
});
