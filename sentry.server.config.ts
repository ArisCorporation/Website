import * as Sentry from '@sentry/nuxt';

Sentry.init({
  dsn: 'https://0e733ab4766a0cc7b6d93c46c0ae8c2c@o4506514132697088.ingest.us.sentry.io/4508065034928128',
  environment: 'production',
  // Tracing
  // We recommend adjusting this value in production, or using a tracesSampler for finer control.
  tracesSampleRate: 1.0, // Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: ['localhost', /^https:\/\/cms.ariscorp\.de/],
});
