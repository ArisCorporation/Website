// import { H3Error } from 'h3';
// import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { Toucan } from 'toucan-js';

export default defineNitroPlugin((nitroApp) => {
  const {
    public: { sentry },
  } = useRuntimeConfig();

  nitroApp.hooks.hook('error', (err, context) => {
    const Sentry = new Toucan({
      dsn: sentry.dsn,
      environment: sentry.environment,
      integrations: [nodeProfilingIntegration()],
      initialScope: {
        tags: { server: true },
      },
    });

    Sentry.captureException(err);
  });
});
