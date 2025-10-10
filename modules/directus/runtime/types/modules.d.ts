import type { RestClient, WebSocketClient } from "@directus/sdk";

type DirectusNuxtClient = RestClient<DirectusSchema> & WebSocketClient<DirectusSchema>;

declare module "#app" {
  interface NuxtApp {
    $directus: DirectusNuxtClient;
  }
  interface RuntimeNuxtHooks {
    "directus:loggedIn": (state: boolean) => void;
  }
}

declare module "vue" {
  interface ComponentCustomProperties {
    $directus: DirectusNuxtClient;
  }
}

declare global {
  interface DirectusSchema { }
}

export { };
