export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { user, setUser } = useDirectusAuth();
  if (!user.value) {
    return navigateTo({
      path: '/ams/login',
      query: {
        redirect: encodeURIComponent(to.fullPath),
      },
    });
  }
});
