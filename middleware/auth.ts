export default defineNuxtRouteMiddleware(async (to, _from) => {
  const { refreshTokenCookie, refresh, tokens, readMe, user } = useDirectusAuth({ staticToken: false });
  const nuxtApp = useNuxtApp();
  const queryString = Object.entries(to.query)
    .filter(([key]) => key !== 'redirect')
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const fullPath = to.path + (queryString ? `?${queryString}` : '');

  if (!user.value) {
    if (!nuxtApp.isHydrating) {
      return abortNavigation();
    } else {
      return navigateTo({
        path: '/ams/login',
        query: {
          redirect: encodeURIComponent(fullPath),
        },
      });
    }
  }

  // if (!user.value) {
  //   /*
  //     const path = '/ams/login';
  //     const queries = {
  //       redirect: "/ams",
  //       pw: 'dsaodaps'
  //     };

  //     const queryString = Object.entries(queries)
  //       .map(([key, value]) => `${key}=${value}`)
  //       .join('&');

  //     const fullPath = path + (queryString ? `?${queryString}` : '');
  //   */
  //   const queryString = Object.entries(to.query)
  //     .filter(([key]) => key !== 'redirect')
  //     .map(([key, value]) => `${key}=${value}`)
  //     .join('&');

  //   const fullPath = to.path + (queryString ? `?${queryString}` : '');

  //   if (to.path !== '/login') {
  //     return navigateTo({
  //       path: '/ams/login',
  //       query: {
  //         redirect: encodeURIComponent(fullPath),
  //       },
  //     });
  //   }
  // }
});
