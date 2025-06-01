// /home/lgruber/Development/ArisCorporation/Website/stores/auth.ts
import { defineStore } from 'pinia';
import type { DirectusUser as User, Schema, DirectusUser } from '~~/types'; // Korrigierter Pfad
// import useDirectusAuth from '~/modules/directus/runtime/composables/useDirectusAuth'; // Pfad ggf. anpassen
import { navigateTo, useRoute, useRuntimeConfig } from '#imports';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Für Ladezustände während Login/Logout/Fetch
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null as DirectusUser | null,
    isAuthenticated: false,
    isLoading: false, // Beginnt mit false, wird während Auth-Operationen auf true gesetzt
  }),

  getters: {
    currentUser: (state) => state.user,
    currentUserId: (state) => state.user?.id,
    currentUserAL: (state) => state.user?.role?.access_level,
    isUserLoggedIn: (state) => state.isAuthenticated,
    isAuthLoading: (state): boolean => state.isLoading,
  },

  actions: {
    async loginAndRedirect (email: string, password: string): Promise<void> {
      this.isLoading = true;
      // Das Composable wird für die SDK-Interaktion verwendet.
      // Das SDK sollte das Token-Management (Cookies für SSR, localStorage für SPA) übernehmen.
      const { performSdkLogin } = useDirectusAuth<Schema>();

      try {
        // performSdkLogin führt den SDK-Login durch und gibt den Benutzer zurück.
        const loggedInUser = await performSdkLogin(email, password);

        // Aktualisiere den Store-Zustand
        this.user = loggedInUser;
        this.isAuthenticated = true;

        const route = useRoute();
        const returnPath = route.query.redirect?.toString();
        const redirectPath = returnPath || '/ams'; // Deine Standard-Weiterleitungsseite
        await navigateTo(redirectPath);
      } catch (error) {
        // Bei einem Fehler den Store-Zustand zurücksetzen.
        this.user = null;
        this.isAuthenticated = false;
        throw error; // Fehler weitergeben, damit die Komponente ihn behandeln kann
      } finally {
        this.isLoading = false;
      }
    },

    async logoutAndRedirect (): Promise<void> {
      this.isLoading = true;
      const { performSdkLogout } = useDirectusAuth<Schema>();
      const config = useRuntimeConfig();

      try {
        await performSdkLogout();
        // Nach erfolgreichem SDK-Logout den Store-Zustand zurücksetzen.
        this.user = null;
        this.isAuthenticated = false;

        await navigateTo(config.public?.directus?.auth?.redirect?.login || '/auth/login');
      } catch (error) {
        console.error("Logout fehlgeschlagen:", error);
        // Auch bei einem Fehler den Store-Zustand zurücksetzen.
        this.user = null;
        this.isAuthenticated = false;
      } finally {
        this.isLoading = false;
      }
    },

    async _syncUserFromSdk (
      performSdkFetchUser: () => Promise<User | null>
    ): Promise<void> {
      // Diese Aktion dient dazu, den Benutzer zu laden, wenn bereits ein Token vorhanden ist
      // (z.B. beim Laden der App) und den Store zu aktualisieren.
      // Der isLoading-Zustand wird vom Aufrufer (z.B. initializeAuth) verwaltet.
      // const { performSdkFetchUser } = useDirectusAuth<Schema>(); // Moved to caller
      try {
        // performSdkFetchUser versucht, den Benutzer basierend auf dem vorhandenen Token (Cookie/localStorage) abzurufen.
        const fetchedUser = await performSdkFetchUser();
        this.user = fetchedUser;
        this.isAuthenticated = !!fetchedUser; // Sicherstellen, dass isAuthenticated korrekt gesetzt wird
      } catch (error) {
        console.error("Fehler beim Synchronisieren des Benutzers vom SDK:", error);
        // Wenn der Abruf fehlschlägt (kein Token, ungültiges Token etc.), ist der Benutzer nicht authentifiziert.
        this.user = null;
        this.isAuthenticated = false;
        // Es ist nicht zwingend notwendig, den Fehler hier weiterzugeben,
        // da initializeAuth den Zustand bereits korrekt setzt.
        // throw error; // Einkommentieren, falls der Aufrufer den Fehler spezifisch behandeln muss.
      }
    },

    async initializeAuth (): Promise<void> {
      // Diese Aktion wird von einem Nuxt-Plugin beim Client-Start aufgerufen

      // Wenn bereits authentifiziert (z.B. durch SSR oder vorherige Client-Aktion),
      // sicherstellen, dass isLoading false ist und nichts weiter tun.
      if (this.isAuthenticated) {
        this.isLoading = false; // Stelle sicher, dass isLoading korrekt ist.
        return;
      }

      // Wenn ein anderer Authentifizierungsvorgang bereits aktiv ist, nichts weiter tun.
      if (this.isLoading) {
        return;
      }

      this.isLoading = true;
      const { getSdkToken, performSdkLightweightUserCheck, performSdkFetchUser } = useDirectusAuth<Schema>();

      try {
        const token = getSdkToken(); // Schnelle Prüfung: Existiert ein Token-String?

        if (token) {
          // Tiefere Prüfung: Ist der Token (wahrscheinlich) gültig, indem minimale Benutzerdaten angefordert werden?
          const minimalUser = await performSdkLightweightUserCheck();

          if (minimalUser) {
            this.isAuthenticated = true;
            this.user = minimalUser; // Setze minimale Benutzerdaten sofort

            // Lade vollständige Benutzerdaten. Fehler hier sollten nicht unbedingt den isAuthenticated-Status zurücksetzen,
            // es sei denn, es ist ein kritischer Fehler, der die Sitzung ungültig macht.
            // Stelle sicher, dass dieser Aufruf awaited wird, damit der Server wartet.
            await this._syncUserFromSdk(() =>
              performSdkFetchUser({ fields: ['*', { role: ['*'] }] })
            );
          } else {
            this.isAuthenticated = false;
            this.user = null;
          }
        } else {
          this.isAuthenticated = false;
          this.user = null;
        }
      } catch (error) {
        console.error("AuthStore: Unerwarteter Fehler während initializeAuth:", error);
        this.isAuthenticated = false;
        this.user = null;
      } finally {
        // isLoading wird am Ende des gesamten initializeAuth-Prozesses auf false gesetzt,
        // nachdem alle (auch die vollständigen Benutzerdaten) geladen oder fehlgeschlagen sind.
        this.isLoading = false;
      }
    },

    setUser (newUser: DirectusUser | null) {
      this.user = newUser;
      this.isAuthenticated = !!newUser;
    },

    async refreshCurrentUser (): Promise<void> {
      if (!this.isAuthenticated) {
        console.warn("AuthStore: refreshCurrentUser aufgerufen, aber kein Benutzer ist authentifiziert.");
        return;
      }
      this.isLoading = true; // Optional: Ladezustand für den Refresh setzen
      try {
        const { performSdkFetchUser } = useDirectusAuth<Schema>();
        const refreshedUser = await performSdkFetchUser({
          fields: ['*', { role: ['*'] }],
        }); // oder spezifischere Felder
        this.setUser(refreshedUser);
      } catch (error) {
        console.error("AuthStore: Fehler beim Aktualisieren der Benutzerdaten:", error);
        // Optional: Fehlerbehandlung, z.B. Benutzer ausloggen, wenn Token ungültig wurde
        this.logoutAndRedirect(); // Beispiel
      } finally {
        this.isLoading = false; // Ladezustand zurücksetzen
      }
    },

  }
});
