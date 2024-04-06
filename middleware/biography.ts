export default defineNuxtRouteMiddleware(async (to, _from) => {
  if (to.fullPath.startsWith('/ams')) {
    const { user, setUser } = useDirectusAuth();
    if (!user.value) {
      return navigateTo({
        path: '/ams/login',
        query: {
          redirect: encodeURIComponent(to.fullPath),
        },
      });
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
