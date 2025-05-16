// types/nuxt.d.ts

import type {
  DirectusClient as SDKDirectusClient,
  RestClient,
  AuthenticationClient, // Stellt das .auth Objekt und Methoden bereit
  StaticTokenClient     // Erweitert das .auth Objekt um staticToken
  // Fügen Sie hier weitere Typen hinzu, die Sie direkt benötigen, z.B. User, LoginCredentials
} from '@directus/sdk';

// Verwenden Sie 'any' für das Schema zu Testzwecken
type DirectusSchema = any;

// Definieren Sie den Client-Typ
export type AppDirectusClient = SDKDirectusClient<DirectusSchema> &
  RestClient<DirectusSchema> &
  AuthenticationClient<DirectusSchema> &
  StaticTokenClient<DirectusSchema>;

// Erweitern Sie die NuxtApp Interface
declare module '#app' {
  interface NuxtApp {
    $directus: AppDirectusClient;
  }
}

// Erweitern Sie Vue Component Properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $directus: AppDirectusClient;
  }
}

// Wichtig, damit die Datei als Modul behandelt wird
export { };