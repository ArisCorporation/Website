<script setup lang="ts">
import { readItems } from '@directus/sdk'; // Importiere Query-Funktionen

const { $directus } = useNuxtApp();
const authStore = useAuthStore();

// Typ für deine Posts-Collection (optional, aber empfohlen)
interface Post {
  id: string | number;
  title: string;
  status: string;
  // ... andere Felder
}

// Beispiel: Abrufen von veröffentlichten Posts
// useAsyncData stellt sicher, dass dies serverseitig (falls möglich) und clientseitig funktioniert.
const { data: posts, pending, error, refresh } = await useAsyncData<Post[]>(
  'posts', // Eindeutiger Key für die Daten
  async () => {
    try {
      // Hier musst du sicherstellen, dass der Token für die Anfrage verwendet wird,
      // wenn die 'posts' Collection geschützt ist.
      // Wenn die `authentication` Composable im Plugin korrekt konfiguriert ist und
      // den Token (z.B. aus dem Cookie) automatisch für Anfragen verwendet,
      // ist kein manuelles Token-Handling hier nötig.

      // Wenn du den Token manuell hinzufügen musst (z.B. wenn `authentication`
      // nicht wie erwartet den Cookie-Token nutzt):
      // const token = authStore.accessToken;
      // if (authStore.isAuthenticated && token) {
      //   return $directus.request(
      //     withToken(token, readItems('posts', {
      //       filter: { status: { _eq: 'published' } }
      //     }))
      //   );
      // } else {
      //   // Für öffentliche Daten, wenn kein Token benötigt wird
      //   return $directus.request(readItems('posts', {
      //     filter: { status: { _eq: 'published' } }
      //   }));
      // }

      // Idealerweise handhabt der im Plugin konfigurierte Client ($directus)
      // die Authentifizierung automatisch basierend auf dem eingeloggten Zustand.
      return await $directus.request(readItems('posts', {
        filter: { status: { _eq: 'published' } }
        // fields: ['id', 'title', 'status'] // Spezifiziere Felder für bessere Performance
      }));

    } catch (e) {
      console.error("Error fetching posts:", e);
      // Hier kannst du den Fehler genauer behandeln oder transformieren
      throw e; // Wirft den Fehler, damit useAsyncData ihn in `error` abbildet
    }
  },
  {
    // Optional: Standardwert oder Transformationen
    // default: () => [],
    // transform: (data) => data.map(post => ({ ...post, transformed: true })),
    // watch: [() => authStore.accessToken] // Neu laden, wenn Token sich ändert (z.B. nach Login)
  }
);

// Wenn `posts` authentifizierte Daten sind, stelle sicher, dass die Seite
// `requiresAuth: true` hat oder du die Logik hier anpasst, falls der Benutzer
// nicht authentifiziert ist (z.B. leere Daten zurückgeben oder eine Meldung anzeigen).
definePageMeta({
  // Beispiel: Wenn Posts nur für eingeloggte User sind
  // requiresAuth: true,
});

</script>

<template>
  <div>
    <PagesHomeHero />
    <UiPage>
      test
    </UiPage>
  </div>
</template>
