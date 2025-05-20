import { readMe, passwordRequest, passwordReset } from '@directus/sdk';
import type { RestClient, AuthenticationClient } from '@directus/sdk';
import type { Schema } from '~~/types';
import type { DirectusUser as User } from '~~/types';

import { useState, useRuntimeConfig, useRoute, navigateTo, clearNuxtData, useNuxtApp } from '#imports';

export default function useDirectusAuth<Schema extends object> () {
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

    console.log('before login')
    const response = await $directus.login(email, password);
    console.log('after login')
    console.log('login response', response)

    const returnPath = route.query.redirect?.toString();
    const redirect = returnPath ? returnPath : '/ams';

    _loggedIn.set(true);

    setTimeout(async () => {
      await fetchUser({ fields: ['*'] });
      await navigateTo(redirect);
    }, 100);
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