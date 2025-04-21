import {
  createDirectus,
  rest,
  readItems,
  readUsers,
  registerUser,
  authentication,
  readMe,
  refresh,
  logout as directusLogout,
  type AuthenticationStorage
} from "@directus/sdk";

export default defineNuxtPlugin(() => {
  class NuxtCookieStorage {
    cookie = useCookie("directus-data");
    get () {
      return this.cookie.value;
    }
    set (data: any) {
      this.cookie.value = data;
    }
  }

  const storage = new NuxtCookieStorage() as AuthenticationStorage;

  const directus = createDirectus<any>(
    "https://cms.ariscorp.de",
  )
    .with(authentication("cookie", { credentials: "include", storage }))
    .with(rest({ credentials: "include" }));

  const isAuthenticated = async () => {
    try {
      const me = await directus.request(readMe());
      return me;
    } catch (error: any) {
      if (error?.errors[0]?.extensions?.code === 'INVALID_CREDENTIALS') return false

      console.error(error)
      return false;
    }
  };

  const refreshToken = async () => {
    return directus.refresh()
  };

  const logout = async () => {
    await directus.logout()
    navigateTo('/login')
  }

  return {
    provide: { directus, readItems, readUsers, registerUser, isAuthenticated, refreshToken, logout },
  };
});