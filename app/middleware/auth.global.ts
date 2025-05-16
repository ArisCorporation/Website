// middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Das NuxtApp-Objekt ist hier nicht direkt über useNuxtApp() im globalen Middleware-Kontext verfügbar,
  // bevor die App vollständig initialisiert ist. Der Store sollte jedoch funktionieren.
  const authStore = useAuthStore()

  // Stelle sicher, dass initAuth abgeschlossen ist, bevor die Middleware Entscheidungen trifft
  // Dies ist besonders wichtig beim ersten Laden der Seite
  if (authStore.status === AuthStatus.PENDING) {
    // Wenn wir von SSR kommen und der Status PENDING ist, könnte initAuth noch laufen.
    // Wenn client-seitige Navigation, kann initAuth schon gelaufen sein.
    // Für robuste Handhabung: Warte auf initAuth, wenn noch nicht abgeschlossen.
    // Dies kann zu einem kurzen "Flimmern" führen, wenn nicht richtig gehandhabt.
    // Eine Möglichkeit ist, in app.vue einen Ladezustand zu zeigen, bis initAuth fertig ist.
    // Hier vereinfacht: Wenn PENDING, dann gehe davon aus, dass initAuth noch läuft oder fehlgeschlagen ist.
    // Besser: initAuth sollte in app.vue aufgerufen werden und seinen Abschluss signalisieren.
    // Für die Middleware können wir davon ausgehen, dass initAuth bereits versucht wurde.
  }

  const isAuthenticated = authStore.isAuthenticated

  // Zugriff auf Seiten-Metadaten
  const requiresAuth = to.meta.requiresAuth === true
  const guestOnly = to.meta.guestOnly === true

  if (process.server && authStore.status === AuthStatus.PENDING) {
    // Auf dem Server, wenn der Status PENDING ist, versuchen wir, den Benutzer zu laden,
    // falls ein Token im Cookie vorhanden ist (was initAuth tun würde).
    // Dies ist wichtig, damit SSR geschützte Routen korrekt rendert oder umleitet.
    await authStore.initAuth()
    // Aktualisiere isAuthenticated nach dem serverseitigen initAuth Versuch
    // const isAuthenticatedAfterServerInit = authStore.isAuthenticated;
    // Hier könnten wir Logik hinzufügen, um Server-seitig umzuleiten.
    // Nuxt macht das aber meist client-seitig nach der Hydration besser.
  }


  // Logik für geschützte Routen
  if (requiresAuth && !isAuthenticated) {
    if (process.server) {
      // Serverseitige Umleitung ist knifflig mit Nuxt 3 global middleware.
      // Oft besser, dies clientseitig zu handhaben oder einen Ladezustand zu zeigen
      // und clientseitig umzuleiten.
      // Für einen direkten Redirect:
      // return navigateTo('/login', { external: false, replace: true }); // external: false für intern
    }
    // Speichere die Ziel-URL für eine Weiterleitung nach dem Login
    // if (to.fullPath !== '/') {
    //   useCookie('redirectAfterLogin').value = to.fullPath;
    // }
    return navigateTo('/login', { replace: true }) // Clientseitige Umleitung
  }

  // Logik für reine Gast-Routen (z.B. Login-Seite)
  if (guestOnly && isAuthenticated) {
    return navigateTo('/', { replace: true }) // Oder zu einem Dashboard
  }
})