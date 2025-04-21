export default defineNuxtRouteMiddleware(async (to, from) => {
  const { $isAuthenticated, $directus } = useNuxtApp();

  const authenticated = await $isAuthenticated();

  if (!authenticated) {
    return navigateTo("/auth/login");
  }

  return;
});
