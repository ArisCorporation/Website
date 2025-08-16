import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    globals: true,
    environment: 'nuxt',
    environmentOptions: {
      nuxt: {
        domEnvironment: 'happy-dom',
        overrides: {
          directus: {
            rest: {
              baseUrl: 'http://localhost:3000',
            },
          },
          public: {
            VERSION: 'v1.2.3',
            SOURCE_COMMIT: 'abcdefg',
            ENVIRONMENT: 'test',
          },
        },
      },
    },
  },
})
