// app/stores/auth.ts
import { defineStore } from 'pinia';
import type { DirectusUser } from '@@/types'; // Passt auf den Pfad zu deinen Typen auf
import { AuthStatus } from '@@/types';      // Passt auf den Pfad zu deinen Typen auf
import { readMe, login as sdkLogin, logout as sdkLogout } from '@directus/sdk';

interface AuthState {
  user: DirectusUser | null;
  status: AuthStatus;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    status: AuthStatus.PENDING, // Startet als 'pending', bis der Status geprüft wurde
  }),

  getters: {
    isAuthenticated: (state): boolean => state.status === AuthStatus.AUTHENTICATED,
    currentUser: (state): DirectusUser | null => state.user,
    authStatus: (state): AuthStatus => state.status,
  },

  actions: {
    setUser (userData: DirectusUser | null) {
      this.user = userData;
      this.status = userData ? AuthStatus.AUTHENTICATED : AuthStatus.UNAUTHENTICATED;
      // console.log('AuthStore: User set, new status:', this.status);
    },

    async fetchUser () {
      // console.log('AuthStore: Versuch, Benutzer abzurufen...');
      const { $directus } = useNuxtApp();
      if (!$directus) {
        // console.warn('AuthStore: Directus Client nicht verfügbar für fetchUser.');
        this.setUser(null); // Setze auf nicht authentifiziert, wenn kein Client da ist
        return;
      }

      try {
        // Ruft den aktuellen Benutzer ab, inklusive aller Felder (*) und der verknüpften Rolle mit all ihren Feldern (role.*)
        // Passe 'role.*' an, falls dein Rollenfeld anders heißt oder du spezifischere Felder benötigst.
        const user = await $directus.request(readMe<DirectusUser>({ fields: ['*', { 'role': ['*'] }] }));
        this.setUser(user);
        // console.log('AuthStore: Benutzer erfolgreich abgerufen:', user);
      } catch (error) {
        // console.warn('AuthStore: Kein authentifizierter Benutzer gefunden oder Fehler beim Abrufen.', error);
        this.setUser(null);
      }
    },

    async login (credentials: { email: string; password: string }) {
      // console.log('AuthStore: Login-Versuch...');
      const { $directus } = useNuxtApp();
      if (!$directus) {
        // console.error('AuthStore: Directus Client nicht verfügbar für Login.');
        throw new Error('Directus Client nicht verfügbar.');
      }

      try {
        await $directus.request(sdkLogin(credentials.email, credentials.password));
        await this.fetchUser(); // Benutzerdaten nach erfolgreichem Login abrufen
        // console.log('AuthStore: Login erfolgreich. Benutzer:', this.user);

        // Weiterleitung nach dem Login
        const route = useRoute();
        // Standard-Weiterleitung zu '/ams' oder zum in der URL-Query angegebenen Pfad
        const redirectPath = route.query.redirect?.toString() || '/ams';
        console.log(redirectPath)
        await navigateTo(redirectPath);
      } catch (error) {
        // console.error('AuthStore: Login fehlgeschlagen.', error);
        this.setUser(null);
        throw error; // Fehler weitergeben, damit das Login-Formular ihn behandeln kann
      }
    },

    async logout () {
      // console.log('AuthStore: Logout-Versuch...');
      const { $directus } = useNuxtApp();
      if (!$directus) {
        // console.warn('AuthStore: Directus Client nicht verfügbar für Logout.');
        this.setUser(null); // Lokalen Status trotzdem zurücksetzen
        await navigateTo('/auth/login');
        return;
      }

      try {
        await $directus.request(sdkLogout());
        // console.log('AuthStore: Logout erfolgreich.');
      } catch (error) {
        // console.error('AuthStore: Logout auf dem Server fehlgeschlagen, lokaler Status wird trotzdem zurückgesetzt.', error);
      } finally {
        this.setUser(null);
        await navigateTo('/auth/login'); // Zur Login-Seite weiterleiten
      }
    },

    /**
     * Initialisiert den Authentifizierungsstatus.
     * Wird typischerweise einmal beim App-Start (z.B. durch die Middleware) aufgerufen.
     */
    async initializeAuth () {
      // console.log('AuthStore: Initialisiere Authentifizierung...');
      if (this.status === AuthStatus.PENDING) {
        await this.fetchUser();
      }
      // console.log('AuthStore: Authentifizierung initialisiert. Status:', this.status);
    },
  },
});
