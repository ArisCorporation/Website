export default defineNuxtRouteMiddleware(async(to, _from) => {
  const { directus } = useCMS();
  const nuxtApp = useNuxtApp();

  // const { data: user } = await useAsyncData('USER', () => directus.request(readMe()));
  const token = await directus.getToken()

  if (!token) {
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
