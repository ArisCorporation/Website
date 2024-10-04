import * as Sentry from '@sentry/nuxt';

Sentry.init({
  // If set up, you can use your runtime config here
  dsn: 'https://0e733ab4766a0cc7b6d93c46c0ae8c2c@o4506514132697088.ingest.us.sentry.io/4508065034928128',
  // dsn: process.env.NUXT_SENTRY_DSN,
  environment: 'production',
  integrations: [
    Sentry.replayIntegration(),
    Sentry.feedbackIntegration({
      // Additional SDK configuration goes in here, for example:
      colorScheme: 'dark',
      triggerLabel: 'Bug Report',
      formTitle: 'Bug Report erstellen',
      submitButtonLabel: 'Bug Report senden',
      cancelButtonLabel: 'Abbrechen',
      confirmButtonLabel: 'Bestätigen',
      addScreenshotButtonLabel: 'Screenshot hinzufügen',
      removeScreenshotButtonLabel: 'Screenshot entfernen',
      nameLabel: 'Name',
      namePlaceholder: 'Chris Roberts',
      emailLabel: 'E-Mail',
      commentsLabel: 'Kommentar',
      emailPlaceholder: 'deine@mail.com',
      isRequiredLabel: 'Erforderlich',
      messageLabel: 'Nachricht',
      messagePlaceholder: 'Beschreibe das Problem',
      successMessageText: 'Vielen Dank für Ihr Feedback!',
      showEmail: false,
      showBranding: false,
    }),
  ],
  // Tracing
  // We recommend adjusting this value in production, or using a tracesSampler for finer control.
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/cms.ariscorp\.de/],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  trackComponents: true,
});
