import {
  createDirectus,
  rest,
  readItems,
  registerUser,
  authentication,
  readMe,
  refresh,
  type AuthenticationStorage
} from "@directus/sdk";

import type { DirectusSchema } from '@@/types'

export default defineNuxtPlugin(() => {
  class NuxtCookieStorage {
    cookie = useCookie('directus-data')
    get () {
      return this.cookie.value
    }
    set (data: any) {
      this.cookie.value = data
    }
  }

  const storage = new NuxtCookieStorage() as AuthenticationStorage

  const directus = createDirectus<DirectusSchema>(
    "http://localhost:3000/directus",
  )
    .with(authentication("cookie", { credentials: "include", storage }))
    .with(rest({ credentials: "include" }));

  const isAuthenticated = async () => {
    try {
      const me = await directus.request(
        readMe(),
      );
      return me
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const refreshToken = async () => {
    return directus.request(
      refresh('cookie')
    );
  };

  return {
    provide: { directus, readItems, registerUser, isAuthenticated, refreshToken },
  };
});
