// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  runtimeConfig: {
    apiKey: process.env.NUXT_API_KEY || 'default_fallback_key',
    apiSecret: process.env.NUXT_API_SECRET,
    discordGuildId: process.env.NXUT_DISCORD_GUILD_ID,
    discordBotToken: process.env.NUXT_DISCORD_BOT_TOKEN,

    public: {
      API_URL: process.env.NUXT_PUBLIC_API_URL || 'https://cms.ariscorp.de',
      SITE_URL: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',

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
      userFields: ['*', { role: ['*'] }], // Select user fields
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
    provider: 'directus',
    directus: {
      baseURL: process.env.NUXT_PUBLIC_API_URL + '/assets',
      modifiers: {
        format: 'webp',
      },
    },
  },

  pinia: {
    storesDirs: ['./app/stores/**'],
  },

  tiptap: {
    prefix: 'Tiptap'
  },

  future: {
    compatibilityVersion: 4
  },

  compatibilityDate: '2024-11-01',

})