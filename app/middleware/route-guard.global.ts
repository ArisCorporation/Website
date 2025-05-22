// /home/lgruber/Development/ArisCorporation/Website/middleware/route-guard.global.ts
import { useAuthStore } from '~/stores/auth'; // Pfad zu deinem Auth-Store anpassen
import { navigateTo, useRuntimeConfig } from '#imports';
import type { DirectusRole } from '~~/types'; // Importiere den DirectusRole Typ

export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore();
  const config = useRuntimeConfig();

  // Standardpfade für Weiterleitungen (können aus der Runtime-Config oder direkt hier definiert werden)
  const loginPath = config.public?.directus?.auth?.redirect?.login || '/auth/login';
  // Definiere einen Standardpfad für bereits eingeloggte Benutzer, die eine Gast-Seite aufrufen
  const defaultAuthenticatedPath = config.public?.directus?.auth?.redirect?.home || '/ams';
  // Definiere einen Pfad für Benutzer, die nicht die benötigte Berechtigungsstufe haben
  // @TODO ADD FORBIDDEN PAGE
  const forbiddenPath = '/forbidden'; // Oder eine andere Seite deiner Wahl, z.B. '/ams/dashboard'


  // Das auth.ts Plugin sollte sicherstellen, dass initializeAuth() bereits ausgeführt wurde
  // und authStore.isUserLoggedIn den korrekten Status hat.
  // Ein zusätzlicher Check auf authStore.isLoading könnte für komplexe Szenarien nützlich sein,
  // ist aber meist nicht nötig, da Plugins vor Middleware laufen.

  const requiresAuth = to.meta.auth === true;
  const requiresGuest = to.meta.guest === true;
  const requiredAccessLevel = typeof to.meta.access_level === 'number' ? to.meta.access_level : undefined;

  if (requiresAuth && requiresGuest) {
    console.warn(`Route ${to.path} ist sowohl als 'auth' als auch als 'guest' markiert. Auth-Anforderung wird priorisiert.`);
  }

  // Wenn die Route Authentifizierung erfordert
  if (requiresAuth) {
    if (!authStore.isUserLoggedIn) {
      // Benutzer ist nicht eingeloggt, aber die Seite erfordert Authentifizierung.
      // Leite zum Login weiter und speichere den ursprünglichen Pfad für die Rückkehr.
      return navigateTo({ path: loginPath, query: { redirect: to.fullPath } });
    }

    // Wenn Authentifizierung erforderlich ist UND ein access_level definiert ist
    if (requiredAccessLevel !== undefined) {
      const currentUser = authStore.currentUser;
      // Stelle sicher, dass currentUser und currentUser.role existieren und role ein Objekt mit access_level ist
      const userAccessLevel = (currentUser?.role && typeof currentUser.role === 'object' && 'access_level' in currentUser.role)
        ? (currentUser.role as DirectusRole).access_level ?? 0 // Standardwert 0, falls access_level null ist
        : undefined;

      if (userAccessLevel === undefined) {
        return navigateTo(forbiddenPath); // Oder eine andere Fehlerbehandlung
      }

      if (userAccessLevel < requiredAccessLevel) {
        return navigateTo(forbiddenPath);
      }
    }
  }
  // Wenn die Route nur für Gäste ist (z.B. Login-Seite)
  else if (requiresGuest) {
    if (authStore.isUserLoggedIn) {
      // Benutzer ist eingeloggt, aber die Seite ist nur für Gäste.
      // Leite zu einer Standardseite für eingeloggte Benutzer weiter.
      return navigateTo(defaultAuthenticatedPath);
    }
  }

  // Wenn keine spezifischen auth/guest-Anforderungen bestehen oder diese erfüllt sind,
  // erlaube den Zugriff auf die Route.
});
