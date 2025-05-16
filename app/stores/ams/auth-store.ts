// stores/auth.ts
import { defineStore } from 'pinia'
import type { DirectusUsers as User } from '@@/types' // Importiere den User-Typ vom SDK, falls verfügbar oder definiere deinen eigenen
import { readMe } from '@directus/sdk'

// Definiere deinen User-Typ basierend auf deiner Directus User Collection
// Beispiel:
export interface DirectusUser extends User {
  // ... weitere benutzerspezifische Felder
}

export enum AuthStatus {
  PENDING = 'PENDING',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
}

interface AuthState {
  user: DirectusUser | null
  status: AuthStatus
  accessToken: string | null
  // refreshToken: string | null; // Optional, wenn du Refresh-Token-Flow manuell implementierst
  // expiresAt: number | null;    // Optional
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    status: AuthStatus.PENDING,
    accessToken: useCookie<string | null>('directus_token').value, // Lade Token aus Cookie
    // refreshToken: useCookie<string | null>('directus_refresh_token').value,
    // expiresAt: useCookie<number | null>('directus_token_expires_at').value,
  }),

  getters: {
    isAuthenticated: state => state.status === AuthStatus.AUTHENTICATED && !!state.user,
    currentUser: state => state.user,
    isLoading: state => state.status === AuthStatus.PENDING,
  },

  actions: {
    setAuthData (accessToken: string, user?: DirectusUser | null /*, refreshToken?: string, expiresIn?: number */) {
      const tokenCookie = useCookie('directus_token', { maxAge: 60 * 60 * 24 * 7 /* 7 Tage */ })
      // const refreshTokenCookie = useCookie('directus_refresh_token', { maxAge: 60 * 60 * 24 * 30 /* 30 Tage */ });
      // const expiresAtCookie = useCookie('directus_token_expires_at');

      tokenCookie.value = accessToken
      // if (refreshToken) refreshTokenCookie.value = refreshToken;
      // if (expiresIn) {
      //   const newExpiresAt = Date.now() + expiresIn * 1000;
      //   expiresAtCookie.value = newExpiresAt.toString();
      //   this.expiresAt = newExpiresAt;
      // }

      this.accessToken = accessToken
      if (user) {
        this.user = user
      }
      this.status = AuthStatus.AUTHENTICATED
    },

    async clearAuthData () {
      const tokenCookie = useCookie('directus_token')
      // const refreshTokenCookie = useCookie('directus_refresh_token');
      // const expiresAtCookie = useCookie('directus_token_expires_at');

      tokenCookie.value = null
      // refreshTokenCookie.value = null;
      // expiresAtCookie.value = null;

      this.user = null
      this.accessToken = null
      // this.refreshToken = null;
      // this.expiresAt = null;
      this.status = AuthStatus.UNAUTHENTICATED

      // Wichtig: Informiere den Directus Client, dass der Token entfernt wurde,
      // falls er intern einen Token cacht, den wir nicht über den Cookie steuern.
      // Da wir `authentication()` nutzen, aber Tokens manuell via Cookie setzen,
      // ist es gut, den Client ggf. zurückzusetzen oder ihm explizit keinen Token zu geben.
      // Die `logout` Methode des SDKs macht dies intern, wenn sie verwendet wird.
      // const { $directus } = useNuxtApp()
      // if (await $directus.getToken()) {
      //   $directus.auth.token = null // Oder eine spezifischere Methode, falls vorhanden
      // }
    },

    async login (email: string, password: string) {
      const { $directus } = useNuxtApp()
      try {
        this.status = AuthStatus.PENDING
        // Directus SDK's login gibt Auth-Daten zurück (access_token, expires, refresh_token)
        // Wir verwenden mode: 'json', um die Tokens manuell zu handhaben.
        const authResponse = await $directus.login(
          email,
          password,
          // mode: 'json' // Standard für SDK ist oft Cookie. 'json' gibt uns Kontrolle.
          // Die Doku sagt, dass `authentication()` die Token-Speicherung übernimmt.
          // Wenn `mode` nicht gesetzt ist, versucht es wahrscheinlich Cookies.
          // Für maximale Kontrolle und Kompatibilität mit SSR/Cookies:
          // Wir rufen login ab, nehmen den Token und setzen ihn selbst in den Cookie.
        )

        if (authResponse.access_token) {
          // $directus.auth.token wird intern durch login() gesetzt, wenn mode nicht 'json' ist
          // oder wir setzen ihn manuell, wenn wir 'json' verwenden:
          // $directus.auth.setToken(authResponse.access_token); // Nur wenn `staticToken` Composable genutzt wird

          // Wir speichern den Token, den `login()` uns gibt (oder der intern gesetzt wurde)
          // und holen dann den User.
          this.accessToken = authResponse.access_token // Speichere diesen Token im Cookie
          await this.fetchUser(authResponse.access_token) // User mit dem neuen Token holen
          this.setAuthData(authResponse.access_token, this.user /*, authResponse.refresh_token, authResponse.expires */)
        } else {
          throw new Error('Login failed, no access token received.')
        }
        return true
      } catch (error) {
        this.clearAuthData()
        console.error('Login failed:', error)
        throw error
      }
    },

    async logout () {
      const { $directus } = useNuxtApp()
      try {
        // Rufe die Logout-Funktion des SDK auf, um serverseitige Sessions/Tokens zu invalidieren
        // und den internen Token-Cache des SDK-Clients zu löschen.
        await $directus.logout()
      } catch (error) {
        console.warn('Error during SDK logout, proceeding to clear client data:', error)
      } finally {
        // Unabhängig vom SDK-Logout-Erfolg, lösche clientseitige Daten.
        this.clearAuthData()
      }
    },

    async fetchUser (tokenToUse?: string): Promise<DirectusUser | null> {
      const { $directus } = useNuxtApp()
      const token = tokenToUse || this.accessToken

      if (!token) {
        this.clearAuthData() // Stellt sicher, dass der Status UNAUTHENTICATED ist, wenn kein Token vorhanden ist.
        return null
      }

      try {
        // Setze den Token für diese Anfrage, falls noch nicht global im Client gesetzt oder veraltet
        // Das SDK sollte den Token aus $directus.auth.token (intern gesetzt durch login oder manuell) verwenden.
        // Wenn wir den Token manuell im Cookie verwalten, müssen wir sicherstellen, dass $directus.auth.token aktuell ist.
        // Alternativ:
        // const user = await $directus.users.me.read<DirectusUser>({ /* query params */ }, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // Besser ist es aber, den Token über die SDK-Mechanismen zu verwalten.
        // Nach einem Login sollte $directus.auth.token gesetzt sein.

        // Wenn wir den Token manuell per Cookie setzen, müssen wir ihn vor Anfragen dem SDK-Client bekannt machen,
        // falls er ihn nicht automatisch aus dem Cookie liest (abhängig von der SDK Konfiguration).
        // Die `authentication()` Composable sollte dies aber managen.

        // Versuche, den aktuellen Token zu verwenden, der im Store (und Cookie) ist.
        // Wenn der SDK-Client `authentication()` nutzt, sollte er den Token selbst verwalten.
        // Wir stellen sicher, dass unser Store-Token mit dem Client-Token synchron ist.
        // if ($directus.auth.token !== token) {
        //   // Dies ist ein kritischer Punkt: Wenn `authentication()` den Token nicht automatisch
        //   // aus unserem `useCookie` übernimmt, müssen wir ihn manuell setzen.
        //   // Die `staticToken` Composable hat `.setToken()`. `authentication()` sollte es auch verwalten.
        //   // Wenn `authentication` mode: 'cookie' verwendet, liest es den Cookie selbst (mit dem richtigen Namen).
        //   // Wenn wir mode: 'json' verwenden oder den Cookie-Namen ändern, müssen wir manuell eingreifen.
        //   // Fürs Erste gehen wir davon aus, dass `login()` den Token intern setzt oder wir ihn
        //   // explizit für Anfragen mitgeben (wie im `customEndpoint` Beispiel mit `withToken`).
        // }

        const user = await $directus.request(readMe()) // Directus SDK sollte den Token automatisch verwenden
        this.user = user
        this.status = AuthStatus.AUTHENTICATED
        return user
      } catch (error) {
        console.error('Failed to fetch user:', error)
        // Wenn der Token abgelaufen ist oder ungültig, lösche die Auth-Daten
        // Du könntest hier spezifischer auf 401 Fehler prüfen
        this.clearAuthData()
        return null
      }
    },

    // Initialisierungsfunktion, die in app.vue aufgerufen wird
    async initAuth () {
      if (this.status === AuthStatus.PENDING && this.accessToken) {
        // Wenn ein Token im Cookie ist, versuche den Benutzer zu laden
        await this.fetchUser(this.accessToken)
      } else if (!this.accessToken) {
        this.status = AuthStatus.UNAUTHENTICATED
      }
    },
  },
})