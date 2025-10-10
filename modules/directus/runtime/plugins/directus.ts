import { authentication, createDirectus, realtime, rest } from '@directus/sdk';
import { joinURL } from 'ufo';
import type { Schema } from '~~/types';
import { defineNuxtPlugin, useRoute, useRuntimeConfig } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
  const route = useRoute();
  const config = useRuntimeConfig();

  const siteUrl = config.public.SITE_URL; // http://localhost:3000 from your .env
  const directusProxyUrl = joinURL(siteUrl, '/api/proxy');

  let customFetch = $fetch;

  // If running on the server, create a custom fetch instance that includes
  // cookies from the original request when calling our own proxy.
  if (process.server && nuxtApp.ssrContext && nuxtApp.ssrContext.event) {
    const event = nuxtApp.ssrContext.event;
    customFetch = $fetch.create({
      onRequest ({ request, options }) {
        // Only add cookies if the SDK's request is going to our own proxy URL
        if (typeof request === 'string' && request.startsWith(directusProxyUrl)) {
          const originalCookies = event.node.req.headers.cookie;
          if (originalCookies) {
            options.headers = new Headers(options.headers); // Ensure options.headers is a Headers object
            options.headers.set('cookie', originalCookies);
          }
        }
      }
    });
  }

  let directus = createDirectus<Schema>(directusProxyUrl, { globals: { fetch: customFetch } })
    .with(authentication('session'))
    .with(rest());

  if (process.client) {
    directus = directus.with(
      realtime({
        url: config.public.API_URL,
        heartbeat: true,
        reconnect: { delay: 2000, retries: 10 },
      })
    );
  }

  // ** Live Preview Bits **
  // Check if we are in preview mode
  const preview = route.query.preview && route.query.preview === 'true';
  const token = route.query.token as string | undefined;

  // If we are in preview mode, we need to use the token from the query string
  if (preview && token) {
    directus.setToken(token);

    nuxtApp.hook('page:finish', () => {
      refreshNuxtData();
    });
  }

  return {
    provide: {
      directus,
    },
  };
});
