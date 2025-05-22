// Example of what a correct type definition might look like
// (place this in a relevant .d.ts file, e.g., types/directus.d.ts or your module's types)
import type { RestClient, AuthenticationClient } from '@directus/sdk';
import type { Schema } from '~~/types'; // Adjust path to your global schema type

declare module '#app' {
  interface NuxtApp {
    $directus: RestClient<Schema> & AuthenticationClient<Schema>;
  }
}

declare module '@vue/runtime-core' { // For Vue 3 Options API
  interface ComponentCustomProperties {
    $directus: RestClient<Schema> & AuthenticationClient<Schema>;
  }
}
