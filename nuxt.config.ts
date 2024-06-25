import { defineNuxtConfig } from 'nuxt/config';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import { version } from './package.json';
import ignore from 'rollup-plugin-ignore';
import nodeResolve from '@rollup/plugin-node-resolve';
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
    // '@nuxt/content',
    '@nuxtjs/mdc',
    '@pinia/nuxt',
    // '@vueuse/motion/nuxt',
    '@pinia-plugin-persistedstate/nuxt',
    '@vue-email/nuxt',
    // '@nuxtjs/tailwindcss',
    '@nuxt/ui',
    'dayjs-nuxt',
    'nuxt-lodash',
    'nuxt-tiptap-editor',
    // '@nuxt/test-utils/module',
    // 'nuxt-markdown-render',
    'nuxt-resend',
    '@nuxt/eslint',
  ],
  // plugins: ['~/plugins/vue-cropper.ts'],

  runtimeConfig: {
    authSecret: process.env.NUXT_AUTH_SECRET,
    // cmsToken: process.env.NUXT_CMS_TOKEN,
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
      // NUXT_PUBLIC_SENTRY_DSN_PUBLIC: process.env.NUXT_PUBLIC_SENTRY_DSN_PUBLIC,
      // NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: parseFloat(process.env.NUXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? '0'),
      // NUXT_PUBLIC_SENTRY_REPLAY_SAMPLE_RATE: parseFloat(process.env.NUXT_PUBLIC_SENTRY_REPLAY_SAMPLE_RATE ?? '0'),
      // NUXT_PUBLIC_SENTRY_ERROR_REPLAY_SAMPLE_RATE: parseFloat(
      //   process.env.NUXT_PUBLIC_SENTRY_ERROR_REPLAY_SAMPLE_RATE ?? '0',
      // ),
      // NUXT_SENTRY_AUTH_TOKEN: process.env.NUXT_SENTRY_AUTH_TOKEN,
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
      ignore(['*.node']), // Ignore .node files
      nodeResolve({
        extensions: ['.js', '.json', '.node'], // Handle .node files as external
      }),
    ],
    optimizeDeps: {
      exclude: ['@sentry/profiling-node'],
    },
    build: {
      rollupOptions: {
        plugins: [ignore(['*.node'])],
        external: (id) => id.endsWith('.node'), // Treat .node files as external
      },
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

  directus: {
    url: process.env.NUXT_DIRECTUS_URL,
    authConfig: {
      refreshTokenCookieName: 'ams_refresh_token',
    },
    moduleConfig: {
      autoRefresh: {
        enableMiddleware: false,
        redirectTo: '/ams/login',
        to: ['/ams'],
      },
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

  eslint: {
    config: {
      stylistic: true,
    },
  },
});
