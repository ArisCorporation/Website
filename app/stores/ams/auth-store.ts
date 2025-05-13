// stores/authStore.ts
import { defineStore } from 'pinia';
import type { DirectusUsers as User } from '@@/types'

// Definiere einen Typ für den User, falls du ihn von einer API oder dem SDK bekommst
// Für dieses Beispiel ist es ein einfaches Objekt.

type AuthStatus = 'pending' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus; // 'pending', 'authenticated', 'unauthenticated'
  error: string | null; // Zum Speichern von Login-/Registrierungsfehlern
  // Optional: redirectPath für nach dem Login
  // redirectPath: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    status: 'pending', // Startet als 'pending', bis der Status geprüft wurde
    error: null,
    // redirectPath: null,
  }),
  getters: {
    /**
     * Prüft, ob der Benutzer authentifiziert ist.
     */
    isAuthenticated: (state) => state.status === 'authenticated' && !!state.user,
    /**
     * Prüft, ob der Authentifizierungsstatus noch geprüft wird.
     */
    isLoading: (state) => state.status === 'pending',
    /**
     * Gibt den aktuellen Benutzer zurück.
     */
    currentUser: (state) => state.user,
  },
  actions: {
    /**
     * Simuliert einen Login-Vorgang.
     * In einer echten Anwendung würde hier ein API-Aufruf stattfinden.
     * @param credentials - Anmeldeinformationen (z.B. email, password)
     */
    async login (credentials: { email: string; password?: string }) {
      this.status = 'pending';
      this.error = null;
      try {
        // *** Hier würde dein API-Aufruf zum Login stattfinden ***
        // Beispiel: const response = await $fetch('/api/auth/login', { method: 'POST', body: credentials });
        // Annahme: API gibt bei Erfolg den User zurück
        console.log('Simulating login for:', credentials.email);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simuliere Netzwerkverzögerung

        // Beispielhafte Benutzerdaten nach erfolgreichem Login
        // const loggedInUser: User = {
        //   id: '123',
        //   email: credentials.email,
        //   name: 'Test Benutzer',
        // };

        // this.user = loggedInUser;
        this.status = 'authenticated';
        console.log('Login successful, user set:', this.user);

        // Optional: Weiterleitung nach erfolgreichem Login
        // const router = useRouter();
        // const redirectTo = this.redirectPath || '/internal/dashboard';
        // this.redirectPath = null; // Redirect-Pfad zurücksetzen
        // router.push(redirectTo);

      } catch (err: any) {
        console.error('Login failed:', err);
        this.error = err.data?.message || 'Login fehlgeschlagen.';
        this.status = 'unauthenticated';
        this.user = null;
      }
    },

    /**
     * Simuliert einen Logout-Vorgang.
     */
    async logout () {
      this.status = 'pending';
      try {
        // *** Hier würde dein API-Aufruf zum Logout stattfinden ***
        // Beispiel: await $fetch('/api/auth/logout', { method: 'POST' });
        console.log('Simulating logout...');
        await new Promise(resolve => setTimeout(resolve, 500));

        this.user = null;
        this.status = 'unauthenticated';
        console.log('Logout successful');

        // Navigation zur Login-Seite (oder Startseite)
        // Die Middleware im Canvas leitet bereits zu /login um, wenn eine geschützte Seite aufgerufen wird.
        // Ein explizites navigateTo('/login') hier ist auch möglich.
        const router = useRouter();
        router.push('/login');

      } catch (err) {
        console.error('Logout failed:', err);
        // Setze den Status trotzdem zurück
        this.user = null;
        this.status = 'unauthenticated';
      }
    },

    /**
     * Simuliert das Abrufen des Benutzerstatus (z.B. von einem Cookie/Session-Endpunkt).
     * Setzt den User und den Status im Store.
     * Wird von der Middleware aufgerufen, wenn status 'pending' ist.
     */
    async fetchUser () {
      // Verhindere mehrfaches Fetchen, wenn bereits ein Vorgang läuft oder abgeschlossen ist
      // (außer es ist explizit gewünscht, z.B. durch einen Refresh-Button)
      if (this.status !== 'pending' && this.user) { // Bereits authentifiziert oder unauthentifiziert (und kein User)
        // console.log('fetchUser: Status already determined or user present, skipping fetch.');
        // return; // Frühzeitiger Ausstieg, wenn der Status bereits bekannt ist (außer 'pending')
      }
      // Wenn der Status nicht 'pending' ist, aber wir trotzdem fetchen wollen (z.B. manueller Refresh),
      // dann setzen wir ihn auf 'pending'.
      if (this.status !== 'pending') {
        this.status = 'pending';
      }

      this.error = null;

      try {
        // *** Hier würde dein API-Aufruf zu einem Endpunkt wie `/api/auth/me` stattfinden,
        // der den aktuellen User anhand eines Cookies/Tokens zurückgibt. ***
        console.log('Simulating fetchUser...');
        await new Promise(resolve => setTimeout(resolve, 700)); // Simuliere Netzwerkverzögerung

        // Szenario 1: Benutzer ist eingeloggt (Cookie/Session ist gültig)
        // const userDataFromApi = await $fetch('/api/auth/me');
        // if (userDataFromApi) {
        //   this.user = userDataFromApi as User;
        //   this.status = 'authenticated';
        //   console.log('fetchUser: User found, status authenticated.');
        // } else {
        //   this.user = null;
        //   this.status = 'unauthenticated';
        //   console.log('fetchUser: No user found, status unauthenticated.');
        // }

        // Für dieses Beispiel simulieren wir, dass der User nicht eingeloggt ist,
        // um den Redirect-Flow der Middleware zu testen.
        // Ändere dies, um einen eingeloggten Zustand zu simulieren:
        const simulateLoggedIn = false; // Setze auf true, um einen eingeloggten User zu simulieren
        if (simulateLoggedIn) {
          // this.user = { id: 'existing-user-123', email: 'test@example.com', name: 'Existierender Nutzer' };
          this.status = 'authenticated';
          console.log('fetchUser (simulated): User is authenticated.');
        } else {
          this.user = null;
          this.status = 'unauthenticated';
          console.log('fetchUser (simulated): User is unauthenticated.');
        }

      } catch (err: any) {
        console.error('Failed to fetch user status:', err);
        this.user = null;
        this.status = 'unauthenticated';
        // this.error = 'Fehler beim Abrufen des Benutzerstatus.'; // Optional: Fehler im Store speichern
      }
    },

    // Optional: Aktion zum Speichern des Redirect-Pfads
    // setRedirectPath(path: string | null) {
    //   this.redirectPath = path;
    // }
  },
  // Wenn du pinia-plugin-persistedstate verwendest, um Teile des Stores
  // (z.B. den User nach erfolgreichem Login) im localStorage zu speichern:
  // persist: {
  //   storage: persistedState.localStorage,
  //   paths: ['user', 'status'], // Nur 'user' und 'status' persistieren
  // },
});
