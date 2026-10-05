import { defineNuxtConfig } from 'nuxt/config';
// import { sentryVitePlugin } from '@sentry/vite-plugin';
import vue from '@vitejs/plugin-vue';
import { createRequire } from 'node:module';
import { version } from './package.json';

const nodeRequire = createRequire(import.meta.url);

export default defineNuxtConfig({
  devtools: {
    enabled: true,

    timeline: {
      enabled: true,
    },
  },

  app: {
    buildAssetsDir: '/_legacy/',
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
    },
  },

  css: ['~/assets/css/main.css', '~/assets/css/tailwind.css'],

  // modules: [
  //   '@vueuse/nuxt',
  //   '@nuxt/image',
  //   'nuxt-icon',
  //   'nuxt-headlessui',
  //   'nuxt-directus-next',
  //   // '@nuxt/content',
  //   '@nuxtjs/mdc',
  //   '@pinia/nuxt',
  //   // '@vueuse/motion/nuxt',
  //   '@pinia-plugin-persistedstate/nuxt',
  //   '@vue-email/nuxt',
  //   // '@nuxtjs/tailwindcss',
  //   '@nuxt/ui',
  //   'dayjs-nuxt',
  //   'nuxt-lodash',
  //   'nuxt-tiptap-editor',
  //   // '@nuxt/test-utils/module',
  //   // 'nuxt-markdown-render',
  //   'nuxt-resend',
  //   '@nuxt/eslint',
  // ],
  modules: [
    '@vue-email/nuxt',
    '@nuxt/ui',
    '@nuxt/eslint',
    '@nuxt/image',
    '@pinia/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    'nuxt-tiptap-editor',
    '@vueuse/nuxt',
    // 'dayjs-nuxt',
    '@nuxt/icon',
    'nuxt-headlessui',
    'nuxt-lodash',
    'nuxt-resend',
    '@tresjs/nuxt',
    'radix-vue/nuxt',
    'dayjs-nuxt',
    '@sentry/nuxt/module',
  ],

  // plugins: ['~/plugins/vue-cropper.ts'],

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    directusUrl: process.env.NUXT_DIRECTUS_URL,
    // cmsToken: process.env.NUXT_CMS_TOKEN,
    discordBotToken: process.env.NUXT_DISCORD_BOT_TOKEN,
    discordGuildId: process.env.NUXT_DISCORD_GUILD_ID,
    sentryAuthToken: process.env.NUXT_SENTRY_AUTH_TOKEN,
    sentry: {
      dsn: process.env.NUXT_SENTRY_DSN,
    },
    public: {
      appVersion: version,
      buildNumber: process.env.SOURCE_COMMIT,
      environment: process.env.NUXT_PUBLIC_ENV,
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
      fileBase: process.env.NUXT_PUBLIC_FILE_BASE,
      mbutton: { initial: { scale: 1 }, visible: { scale: 1 }, hovered: { scale: 1 }, tapped: { scale: 0.97 } },
      // NUXT_PUBLIC_SENTRY_DSN_PUBLIC: process.env.NUXT_PUBLIC_SENTRY_DSN_PUBLIC,
      // NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: parseFloat(process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0'),
      // NUXT_PUBLIC_SENTRY_REPLAY_SAMPLE_RATE: parseFloat(process.env.NUXT_PUBLIC_SENTRY_REPLAY_SAMPLE_RATE ?? '0'),
      // NUXT_PUBLIC_SENTRY_ERROR_REPLAY_SAMPLE_RATE: parseFloat(
      //   process.env.NUXT_PUBLIC_SENTRY_ERROR_REPLAY_SAMPLE_RATE ?? '0',
      // ),
      // NUXT_SENTRY_AUTH_TOKEN: process.env.NUXT_SENTRY_AUTH_TOKEN,
    },
  },

  // imports: {
  //   presets: [
  //     {
  //       from: '@sentry/vue',
  //       imports: [
  //         {
  //           as: 'Sentry',
  //           name: '*',
  //         },
  //       ],
  //     },
  //   ],
  // },

  // sourcemap: true,
  // SENTRY CONFIG
  vite: {
    vue: {
      script: {
        defineModel: true,
        propsDestructure: true,
      },
    },
    // build: {
    //   rollupOptions: {
    //     external: ['@directus/sdk'],
    //   },
    // },
    //   plugins: [
    //     // Put the Sentry vite plugin after all other plugins
    //     sentryVitePlugin({
    //       authToken: process.env.SENTRY_AUTH_TOKEN,
    //       org: 'ariscorp',
    //       project: 'homepage',
    //     }),
    //   ],
  },

  nitro: {
    externals: {
      external: ['puppeteer', 'puppeteer-core'],
      traceInclude: [nodeRequire.resolve('puppeteer')],
    },
    experimental: {
      bundleRuntimeDependencies: false,
    },
    rollupConfig: {
      external: ['puppeteer', 'puppeteer-core'],
      plugins: [vue()],
    },
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

  headlessui: {
    prefix: 'Headless',
  },

  dayjs: {
    locales: ['de'],
    plugins: ['relativeTime', 'utc', 'timezone'],
    defaultLocale: 'de',
    defaultTimezone: 'Europe/Berlin',
  },

  // dayjs: {
  // 	locales: ['en', 'de'],
  // 	plugins: ['relativeTime', 'utc', 'timezone'],
  // 	defaultLocale: 'de',
  // 	defaultTimezone: 'Europe/Berlin',
  // },

  typescript: {
    shim: false,
  },

  tiptap: {
    prefix: 'Tiptap', // prefix for Tiptap imports, composables not included
  },

  sentry: {
    debug: true,
    sourceMapsUploadOptions: {
      org: 'ariscorp',
      project: 'website',
      authToken: process.env.NUXT_SENTRY_AUTH_TOKEN,
    },
  },

  compatibilityDate: '2024-07-12',
});
