import * as Sentry from '@sentry/vue';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const {
    public: { sentry },
  } = useRuntimeConfig();

  if (!sentry.dsn) {
    return;
  }

  Sentry.init({
    app: nuxtApp.vueApp,
    dsn: sentry.dsn,
    environment: sentry.environment,
    integrations: [
      Sentry.browserTracingIntegration({ router }),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],

    // Configure this whole part as you need it!

    tracesSampleRate: 0.2, // Change in prod

    // Set `tracePropagationTargets` to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: [
      'localhost',
      'https://staging.ariscorp.de',
      'https://ptu.ariscorp.de',
      /^https:\/\/(www\.)?ariscorp\.de$/,
    ],

    replaysSessionSampleRate: 1.0, // Change in prod
    replaysOnErrorSampleRate: 1.0, // Change in prod if necessary
  });

  nuxtApp.hook('app:mounted', async () => {
    try {
      const { addIntegration, Replay } = await import('@sentry/vue');
      const replay = new Replay({
        beforeErrorSampling: (event) => {
          if (event.tags?.['no-sentry-replay']) {
            return false;
          }
          return true;
        },
      });
      addIntegration(replay);
    } catch {
      console.warn('Sentry replay not loaded');
    }
  });
});
