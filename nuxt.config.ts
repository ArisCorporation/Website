// https://nuxt.com/docs/api/configuration/nuxt-config
import { version } from './package.json';

export default defineNuxtConfig({
  devtools: { enabled: true },

  sourcemap: {
    server: true,
    client: true
  },

  app: {
    head: {
      htmlAttrs: {
        lang: 'de',
        'data-app-version': `${version}-${process.env.NUXT_PUBLIC_SOURCE_COMMIT?.slice(0, 7) || 'DEV'}.${process.env.NUXT_PUBLIC_ENVIRONMENT || 'DEVELOPMENT'}`
      }
    }
  },

  runtimeConfig: {
    apiKey: process.env.NUXT_API_KEY || 'default_fallback_key',
    apiSecret: process.env.NUXT_API_SECRET,
    discordGuildId: process.env.NXUT_DISCORD_GUILD_ID,
    discordBotToken: process.env.NUXT_DISCORD_BOT_TOKEN,

    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL || 'https://cms.ariscorp.de',
      SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      SOURCE_COMMIT: process.env.NUXT_PUBLIC_SOURCE_COMMIT || 'DEV',
      ENVIRONMENT: process.env.NUXT_PUBLIC_ENVIRONMENT || 'DEVELOPMENT',
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
    'nuxt-tiptap-editor',
    'nuxt-echarts',
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

  directus: {
    rest: {
      baseUrl: process.env.NUXT_PUBLIC_API_URL || 'http://localhost:8055',
      nuxtBaseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    },
    auth: {
      enabled: true,
      enableGlobalAuthMiddleware: false, // Enable auth middleware on every page
      userFields: ['*', { role: ['*'] }, { primary_department: ['name'] }, { secondary_department: ['name'] }], // Select user fields
      redirect: {
        login: '/auth/login', // Path to redirect when login is required
        logout: '/', // Path to redirect after logout
        home: '/ams', // Path to redirect after successful login
        resetPassword: '/auth/reset-password', // Path to redirect for password reset
        callback: '/auth/callback', // Path to redirect after login with provider
      },
    },
  },

  image: {
    domains: ['cms.ariscorp.de', 'cdn.discordapp.com'],
    provider: 'directus',
    directus: {
      baseURL: 'https://cms.ariscorp.de/assets',
      modifiers: {
        format: 'avif',
      },
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  tiptap: {
    prefix: 'Tiptap'
  },

  echarts: {
    ssr: true,
    renderer: 'svg',
    charts: ['BarChart', 'MapChart', 'PieChart'],
    components: [
      'DatasetComponent',
      'GridComponent',
      'TooltipComponent',
      'ToolboxComponent',
      'GeoComponent',
      'VisualMapComponent',
      'LegendComponent'
    ],
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-01',

})