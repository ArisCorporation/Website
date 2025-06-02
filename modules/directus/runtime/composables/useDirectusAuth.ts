import { readMe } from '@directus/sdk';
import type { RestClient, AuthenticationClient } from '@directus/sdk';
import type { Schema } from '~~/types';
import type { DirectusUser as User } from '~~/types';

import { useRuntimeConfig, clearNuxtData, useNuxtApp } from '#imports';

export default function useDirectusAuth<DirectusSchema extends object> () {
  const nuxtApp = useNuxtApp();
  const $directus = nuxtApp.$directus as RestClient<Schema> & AuthenticationClient<Schema>;

  const config = useRuntimeConfig();

  async function performSdkLogin (email: string, password: string, otp?: string): Promise<User> {
    // Das SDK kümmert sich um das Token-Management (Cookies für SSR, localStorage für SPA-Flows).
    const fields = config.public?.directus?.auth?.userFields || ['*'];
    await $directus.login(email, password, otp ? { otp } : undefined);
    // Nach erfolgreichem SDK-Login die Benutzerdetails abrufen
    const user = await performSdkFetchUser({ fields });
    return user;
  }

  async function performSdkLogout (): Promise<void> {
    // Das SDK kümmert sich um das Entfernen des Tokens.
    await $directus.logout();
    // Löscht Nuxt-spezifische zwischengespeicherte Daten, die mit dem Benutzer zusammenhängen könnten.
    await clearNuxtData();
  }

  async function performSdkFetchUser (params?: object): Promise<User> {
    const fields = config.public?.directus?.auth?.userFields || ['*'];
    // TODO: Die Typisierung für 'fields' könnte verbessert werden, um @ts-ignore zu vermeiden,
    // abhängig von der genauen Struktur der Directus-Schema-Typen.
    const response = await $directus.request(
      readMe({
        // @ts-ignore
        fields,
        ...params,
      }),
    );
    return response as User;
  }

  function getSdkToken (): string | null {
    // Greift auf die interne Methode des SDK zu, um den Token zu erhalten.
    // Dies prüft nicht die Gültigkeit des Tokens auf dem Server.
    return $directus.getToken();
  }

  async function performSdkLightweightUserCheck (): Promise<User | null> {
    // Führt eine minimale Anfrage aus, um die Gültigkeit des Tokens serverseitig zu prüfen.
    // Fordert nur essentielle Felder an, um die Antwort klein zu halten.
    try {
      const minimalUser = await $directus.request(readMe({ fields: ['id', 'email'] }));
      return minimalUser as User;
    } catch (error) {
      // Fängt Fehler ab (z.B. 401 Unauthorized), die auf einen ungültigen/abgelaufenen Token hindeuten.
      console.warn('Lightweight user check failed, token might be invalid:', error);
      return null;
    }
  }

  return {
    performSdkLogin,
    performSdkLogout,
    performSdkFetchUser,
    getSdkToken,
    performSdkLightweightUserCheck,
  };
}