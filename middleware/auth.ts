export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { user, setUser } = useDirectusAuth();
  if (!user.value) {
    /*
      const path = '/ams/login';
      const queries = {
        redirect: "/ams",
        pw: 'dsaodaps'
      };

      const queryString = Object.entries(queries)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const fullPath = path + (queryString ? `?${queryString}` : '');
    */
    const queryString = Object.entries(to.query)
      .filter(([key]) => key !== 'redirect')
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    const fullPath = to.path + (queryString ? `?${queryString}` : '');

    return navigateTo({
      path: '/ams/login',
      query: {
        redirect: encodeURIComponent(fullPath),
      },
    });
  }
});
