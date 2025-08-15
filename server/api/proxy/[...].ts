import { proxyRequest } from 'h3';

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  // This should be your actual Directus instance URL
  const targetBaseUrl = config.public.API_URL; // https://studio.ariscorp.de

  const path = event.context.params._ || '';
  const target = new URL(path, targetBaseUrl);

  // Append query parameters from the original request
  const query = getQuery(event);
  for (const key in query) {
    target.searchParams.append(key, query[key] as string);
  }

  console.log(`[SSR Proxy] Forwarding: ${event.method} ${event.path} to ${target.toString()}`);

  return proxyRequest(event, target.toString(), {
    // proxyRequest should handle cookie forwarding by default from the event it receives.
    // You can add more specific header manipulation here if needed.
  });
});