// /home/lgruber/Development/ArisCorporation/Website/plugins/auth.ts
import { useAuthStore } from '~/stores/auth'; // Pfad ggf. anpassen

export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();

  // Die initializeAuth-Aktion im Store ist so konzipiert, dass sie sowohl auf dem Server
  // als auch auf dem Client aufgerufen werden kann. Sie prüft intern, ob eine
  // Initialisierung notwendig ist.
  // `await` stellt sicher, dass die App-Initialisierung (insbesondere serverseitig)
  // auf den Abschluss dieses Authentifizierungsversuchs wartet.

  if (process.server) {
    await authStore.initializeAuth();
  } else { // process.client
    await authStore.initializeAuth();
  }
});
