import { proxyRequest } from 'h3';
import { getDiscordEnvironment, upsertMissionDiscordShare } from '../../utils/ams-discord-mission-share';

const MISSION_MUTATION_COLLECTIONS = new Set([
  'ams_missions',
  'ams_mission_teams',
  'ams_mission_team_ships',
  'ams_mission_positions',
  'ams_mission_registrations',
]);

type DirectusItemResponse<T> = {
  data?: T | T[] | null;
};

function getCollectionPathParts(path: string) {
  const [cleanPath = ''] = path.split('?');
  return cleanPath.split('/').filter(Boolean);
}

function getCollectionFromPath(path: string) {
  const parts = getCollectionPathParts(path);
  if (parts[0] !== 'items') return null;
  return parts[1] ?? null;
}

function getItemIdFromPath(path: string) {
  const parts = getCollectionPathParts(path);
  return parts[2] ?? null;
}

function getCreatedItemId(payload: DirectusItemResponse<{ id?: string }>) {
  if (Array.isArray(payload.data)) return payload.data[0]?.id ?? null;
  return payload.data?.id ?? null;
}

async function fetchDirectusJson<T>(
  targetBaseUrl: string,
  path: string,
  headers: Headers,
) {
  const response = await fetch(new URL(path, targetBaseUrl), {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Directus lookup failed for ${path} with ${response.status}`);
  }

  return (await response.json()) as T;
}

async function resolveMissionIdForCollection(
  targetBaseUrl: string,
  headers: Headers,
  collection: string,
  itemId: string,
) {
  if (collection === 'ams_missions') return itemId;

  if (collection === 'ams_mission_teams') {
    const payload = await fetchDirectusJson<DirectusItemResponse<{ mission?: string | null }>>(
      targetBaseUrl,
      `items/ams_mission_teams/${itemId}?fields=mission`,
      headers,
    );

    return payload.data && !Array.isArray(payload.data) ? payload.data.mission ?? null : null;
  }

  if (collection === 'ams_mission_team_ships') {
    const payload = await fetchDirectusJson<DirectusItemResponse<{ team?: { mission?: string | null } | null }>>(
      targetBaseUrl,
      `items/ams_mission_team_ships/${itemId}?fields=team.mission`,
      headers,
    );

    return payload.data && !Array.isArray(payload.data) ? payload.data.team?.mission ?? null : null;
  }

  if (collection === 'ams_mission_positions') {
    const payload = await fetchDirectusJson<DirectusItemResponse<{ team_ship?: { team?: { mission?: string | null } | null } | null }>>(
      targetBaseUrl,
      `items/ams_mission_positions/${itemId}?fields=team_ship.team.mission`,
      headers,
    );

    return payload.data && !Array.isArray(payload.data)
      ? payload.data.team_ship?.team?.mission ?? null
      : null;
  }

  if (collection === 'ams_mission_registrations') {
    const payload = await fetchDirectusJson<DirectusItemResponse<{ mission?: string | null }>>(
      targetBaseUrl,
      `items/ams_mission_registrations/${itemId}?fields=mission`,
      headers,
    );

    return payload.data && !Array.isArray(payload.data) ? payload.data.mission ?? null : null;
  }

  return null;
}

async function triggerMissionDiscordSync(options: {
  collection: string;
  method: string;
  path: string;
  targetBaseUrl: string;
  directusHeaders: Headers;
  requestHeaders?: Record<string, string>;
  responsePayload: DirectusItemResponse<{ id?: string }>;
  environment: string | null | undefined;
  botToken?: string;
}) {
  if (!options.botToken) return;
  if (!MISSION_MUTATION_COLLECTIONS.has(options.collection)) return;

  const createIfMissing =
    options.collection === 'ams_missions' && options.method === 'POST';
  const itemId =
    options.method === 'POST'
      ? getCreatedItemId(options.responsePayload)
      : getItemIdFromPath(options.path);

  if (!itemId) return;

  const missionId = await resolveMissionIdForCollection(
    options.targetBaseUrl,
    options.directusHeaders,
    options.collection,
    itemId,
  );

  if (!missionId) return;

  await upsertMissionDiscordShare({
    missionId,
    createIfMissing,
    botToken: options.botToken,
    environment: getDiscordEnvironment(options.environment),
    requestHeaders: options.requestHeaders,
  });
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  // This should be your actual Directus instance URL
  const targetBaseUrl = config.public.API_URL; // https://studio.ariscorp.de

  const path = event.context.params?._ || '';
  const target = new URL(path, targetBaseUrl);

  // Append query parameters from the original request
  const query = getQuery(event);
  for (const key in query) {
    target.searchParams.append(key, query[key] as string);
  }

  console.log(`[SSR Proxy] Forwarding: ${event.method} ${event.path} to ${target.toString()}`);

  const collection = getCollectionFromPath(path);
  const isInternalDiscordUpdate = getHeader(event, 'x-ams-discord-internal') === '1';
  const shouldHandleMissionMutation =
    !isInternalDiscordUpdate &&
    collection &&
    MISSION_MUTATION_COLLECTIONS.has(collection) &&
    ['POST', 'PATCH', 'PUT'].includes(event.method || '');

  if (!shouldHandleMissionMutation) {
    return proxyRequest(event, target.toString(), {
      // proxyRequest should handle cookie forwarding by default from the event it receives.
      // You can add more specific header manipulation here if needed.
    });
  }

  const requestHeaders = getHeaders(event);
  const directusHeaders = new Headers(requestHeaders as HeadersInit);
  directusHeaders.delete('host');

  const rawBody = ['GET', 'HEAD'].includes(event.method || 'GET')
    ? undefined
    : await readRawBody(event, false);

  const response = await fetch(target.toString(), {
    method: event.method,
    headers: directusHeaders,
    body: rawBody,
  });

  if (response.ok) {
    try {
      const payload = (await response.clone().json()) as DirectusItemResponse<{ id?: string }>;
      const cookie = getHeader(event, 'cookie');

      await triggerMissionDiscordSync({
        collection,
        method: event.method || 'GET',
        path,
        targetBaseUrl,
        directusHeaders,
        requestHeaders: cookie ? { cookie } : undefined,
        responsePayload: payload,
        environment: config.public.ENVIRONMENT,
        botToken: config.discordBotToken,
      });
    } catch (error) {
      console.error('Mission Discord auto sync failed', error);
    }
  }

  return response;
});
