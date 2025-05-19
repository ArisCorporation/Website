export enum AuthStatus {
  PENDING = 'pending',          // Prüfung des Auth-Status läuft
  AUTHENTICATED = 'authenticated', // Benutzer ist angemeldet
  UNAUTHENTICATED = 'unauthenticated', // Benutzer ist nicht angemeldet
}