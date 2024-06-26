export default defineNuxtRouteMiddleware((to, _from) => {
  const { refreshTokenCookie, refresh, tokens, readMe, user } = useDirectusAuth();
  const nuxtApp = useNuxtApp();

  if (!user.value) {
    if (nuxtApp.isHydrating) {
      return abortNavigation();
    } else {
      return navigateTo({
        path: '/ams/login',
        query: {
          redirect: to.fullPath,
        },
      });
    }
  }
});
