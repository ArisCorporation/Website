import { defineNuxtConfig } from 'nuxt/config';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { version } from './package.json';
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
    '@vueuse/nuxt',
    '@nuxt/image',
    'nuxt-icon',
    'nuxt-headlessui',
    'nuxt-directus-next',
    '@nuxtjs/mdc',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vue-email/nuxt',
    '@nuxt/ui',
    'dayjs-nuxt',
    'nuxt-lodash',
    'nuxt-tiptap-editor',
    'nuxt-resend',
    'nuxt-meilisearch',
    '@nuxtjs/seo',
  ],

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    siteEnv: process.env.NUXT_PUBLIC_ENV,
    public: {
      appVersion: version,
      buildNumber: process.env.COMMIT_REF || process.env.NUXT_PUBLIC_BUILD_NUMBER,
      environment: process.env.NUXT_PUBLIC_ENV,
      url: process.env.NUXT_PUBLIC_URL,
      backendUrl: process.env.NUXT_PUBLIC_DIRECTUS_URL,
      fileBase: process.env.NUXT_PUBLIC_FILE_BASE,
      mbutton: { initial: { scale: 1 }, visible: { scale: 1 }, hovered: { scale: 1 }, tapped: { scale: 0.97 } },
      // SENTRY VARS
      sentry: {
        dsn: process.env.NUXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NUXT_PUBLIC_ENV,
      },
    },
  },

  imports: {
    presets: [
      {
        from: '@sentry/vue',
        imports: [
          {
            as: 'Sentry',
            name: '*',
          },
        ],
      },
    ],
  },

  // SENTRY CONFIG
  sourcemap: true,
  vite: {
    plugins: [
      // Put the Sentry vite plugin after all other plugins
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: 'ariscorp',
        project: 'homepage',
      }),
    ],
  },

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

  directus: {
    url: process.env.NUXT_DIRECTUS_URL,
    authConfig: {
      refreshTokenCookieName: 'ams_refresh_token',
    },
    // cookieNameToken: 'ams_token',
    // cookieNameRefreshToken: 'ams_refresh_token',
  },

  headlessui: {
    prefix: 'Headless',
  },

  ui: {
    icons: ['heroicons', 'ic', 'mdi', 'fa6-regular', 'fa6-solid', 'radix-icons', 'lucide', 'svg-spinners'],
  },

  dayjs: {
    locales: ['en', 'de'],
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale: 'de',
    defaultTimezone: 'Europe/Berlin',
  },

  typescript: {
    shim: false,
  },

  tiptap: {
    prefix: 'Tiptap', // prefix for Tiptap imports, composables not included
  },

  vueEmail: {
    baseUrl: process.env.NUXT_PUBLIC_FILE_BASE,
    autoImport: true,
  },

  meilisearch: {
    hostUrl: 'https://meilisearch.ariscorp.de',
    searchApiKey: '21fb181a3b5fa5554ba4fab50d8ad1464700424f2f9d76c5cb9ed37071107f64', // required
    adminApiKey: '4qfZcbdDsCJ34gFLDvowwuwQfDtYRoGZT3yBHkrpRKcNWoDyhFzHBd4w9e2k9MrAaaxFexJAUvb4vHUj9xrgno9bUgyTotLLJARs', // optional
    serverSideUsage: true,
  },

  site: {
    url: process.env.NUXT_PUBLIC_URL,
    name: 'Astro Research and Industrial Service Corporation',
    description:
      'Das hier, ist die Homepage der Astro Research and Industrial Service Corporation. Die Astro Research and Industrial Service Corporation (oder kurz: ArisCorp) ist eine fiktive Organisation in dem Universum des Spiels "Star Citizen".',
    defaultLocale: 'de',
  },
});
