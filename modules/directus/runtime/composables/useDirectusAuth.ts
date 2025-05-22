import { readMe, passwordRequest, passwordReset } from '@directus/sdk';
import type { RestClient, AuthenticationClient } from '@directus/sdk';
import type { Schema } from '@@/types';
import type { DirectusUser as User } from '@@/types';

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

  async function login (email: string, password: string) {
    const route = useRoute();

    // Pass otp if provided; the Directus SDK login method supports it as the third argument
    await $directus.login(email, password);

    const returnPath = route.query.redirect?.toString();
    // Use configured home redirect, fallback to '/ams' if not set
    const redirect = returnPath || config.public?.directus?.auth?.redirect?.home || '/ams';

    _loggedIn.set(true);

    await fetchUser(); // fetchUser uses configured fields by default
    await navigateTo(redirect);
  }

  async function logout () {
    const token = await $directus.getToken();

    await $directus.logout();

    user.value = null;

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