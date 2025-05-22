import { readMe, passwordRequest, passwordReset } from '@directus/sdk';
import type { RestClient, AuthenticationClient } from '@directus/sdk';
import type { Schema } from '~~/types';
import type { DirectusUser as User } from '~~/types';

import { useState, useRuntimeConfig, useRoute, navigateTo, clearNuxtData, useNuxtApp } from '#imports';

export default function useDirectusAuth<DirectusSchema extends object> () {
  const nuxtApp = useNuxtApp();
  const $directus = nuxtApp.$directus as RestClient<Schema> & AuthenticationClient<Schema>;

  const user: Ref<User | null | undefined> = useState('user');

  const config = useRuntimeConfig();

  const _loggedIn = {
    get: () => process.client && localStorage.getItem('authenticated'),
    set: (value: boolean) => process.client && localStorage.setItem('authenticated', value.toString()),
  };

  async function login (email: string, password: string, otp?: string) {
    const route = useRoute();

    // 1. Führe den Login über das Directus SDK aus.
    // Das SDK sollte das Token-Management intern handhaben.
    await $directus.login(email, password);

    // 2. Rufe die Benutzerdaten ab, NACHDEM der SDK-Login erfolgreich war.
    // Dies stellt sicher, dass user.value gesetzt ist, bevor weitere Aktionen erfolgen.
    await fetchUser({ fields: ['*', { role: ['*'] }] });

    // 3. Setze den _loggedIn Status im localStorage erst, NACHDEM die Benutzerdaten erfolgreich abgerufen wurden.
    // Dies verhindert einen inkonsistenten Zustand, falls fetchUser fehlschlägt.
    _loggedIn.set(true);

    // 4. Navigiere zur Zielseite.
    const returnPath = route.query.redirect?.toString();
    const redirect = returnPath || '/ams'; // Vereinfachte Zuweisung
    await navigateTo(redirect);
  }

  async function logout () {
    await $directus.logout();
    user.value = null;
    _loggedIn.set(false); // Setze den Status im localStorage auf false
    await clearNuxtData();
    await navigateTo(config.public?.directus?.auth?.redirect?.login || '/auth/login');
  }

  async function fetchUser (params?: object) {
    const fields = config.public?.directus?.auth?.userFields || ['*'];

    const response = await $directus.request(
      readMe({
        // @ts-ignore
        fields,
        ...params,
      }),
    );

    user.value = response as User;
  }

  return {
    user,
    login,
    logout,
    fetchUser,
    _loggedIn,
  };
}