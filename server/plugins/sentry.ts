import { H3Error } from 'h3';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export default defineNitroPlugin((nitroApp) => {
  const {
    public: { sentry },
  } = useRuntimeConfig();

  // If no sentry DSN set, ignore and warn in the console
  if (!sentry.dsn) {
    console.warn('Sentry DSN not set, skipping Sentry initialization');
    return;
  }

  // Initialize Sentry
  Sentry.init({
    dsn: sentry.dsn,
    environment: sentry.environment,
    integrations: [nodeProfilingIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0, // Change in production!
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0, // Change in production!
  });

  nitroApp.hooks.hook('request', (event) => {
    event.context.$sentry = Sentry;
  });

  nitroApp.hooks.hook('error', (error) => {
    // Do not handle 404s and 422s
    if (error instanceof H3Error) {
      if (error.statusCode === 404 || error.statusCode === 422) {
        return;
      }
    }

    Sentry.captureException(error);
  });

  nitroApp.hooks.hookOnce('close', async () => {
    await Sentry.close(2000);
  });
});
