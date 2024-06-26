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
      Sentry.feedbackIntegration({
        colorScheme: 'dark',
        showBranding: false,
        buttonLabel: 'Bug melden',
        formTitle: 'Einen Bug melden',
        namePlaceholder: 'Name oder Discord-Benutzername',
        isNameRequired: true,
        emailLabel: 'Email (optional)',
        emailPlaceholder: 'deine.email@mail.de',
        isEmailRequired: false,
        messageLabel: 'Beschreibe den Bug',
        messagePlaceholder: 'Was ist der Bug? Wobei ist er aufgetreten? Was sollte eigentlich passieren?',
        cancelButtonLabel: 'Abbrechen',
        submitButtonLabel: 'Absenden',
        isRequiredLabel: '(erforderlich)',
        successMessageText: 'Vielen Dank für dein Feedback! Wir werden uns so schnell wie möglich darum kümmern.',
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
