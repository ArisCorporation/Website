const { version } = require('./package.json');
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
    'nuxt-lodash',
  ],

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    cmsToken: process.env.NUXT_CMS_TOKEN,
    public: {
      test: process.env.NUXT_PUBLIC_TEST,
      test2: process.env.NUXT_PUBLIC_TEST2,
      test3: process.env.SOURCE_COMMIT,
      test4: process.env.NUXT_PUBLIC_TEST5,
      test5: process.env.NUXT_PUBLIC_TEST5,
      appVersion: version,
      buildNumber: process.env.SOURCE_COMMIT,
      environment: process.env.NODE_ENV,
      url: process.env.NUXT_PUBLIC_URL,
      backendUrl: 'https://cms.ariscorp.de',
      fileBase: process.env.NUXT_PUBLIC_FILE_BASE,
      mbutton: { initial: { scale: 1 }, visible: { scale: 1 }, hovered: { scale: 1 }, tapped: { scale: 0.97 } },
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

  directus: {
    url: 'https://cms.ariscorp.de',
    cookieNameToken: 'ams_token',
    cookieNameRefreshToken: 'ams_refresh_token',
  },

  headlessui: {
    prefix: 'Headless',
  },

  ui: {
    icons: ['heroicons', 'ic', 'mdi'],
  },

  dayjs: {
    locales: ['en', 'de'],
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale: 'de',
    defaultTimezone: 'Europe/Berlin',
  },
});
