export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (to.fullPath.startsWith('/ams')) {
    const { directus } = useCMS();
    const nuxtApp = useNuxtApp();

    // const { data: user } = await useAsyncData('USER', () => directus.request(readMe()));
    const token = await directus.getToken();

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
    // const { fetchUser, setUser } = useDirectusAuth();
    // const user = useDirectusUser();
    // if (!user.value) {
    //   const user = await fetchUser();
    //   setUser(user.value);
    // }
    // if (!user.value) {
    //   return navigateTo({
    //     path: '/ams/login',
    //     query: {
    //       redirect: encodeURIComponent(to.fullPath),
    //     },
    //   });
    // }
    to.meta.layout = 'ams';
  } else {
    to.meta.layout = 'default';
  }
});
