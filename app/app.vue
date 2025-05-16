<script setup lang="ts">
const authStore = useAuthStore();

// onBeforeMount oder watchEffect kann hier verwendet werden.
// `await` direkt in setup von app.vue wird serverseitig ausgeführt und blockiert das Rendering,
// was wir für fetchUser vermeiden wollen, wenn es nicht kritisch ist.
// `initAuth` ist so gestaltet, dass es non-blocking fetcht, falls ein Token da ist.

if (process.server) {
  // Auf dem Server: initAuth aufrufen, um den User-Status für das erste Rendering zu setzen.
  // Dies hilft, korrektes SSR für authentifizierte Zustände zu ermöglichen.
  await authStore.initAuth();
} else {
  // Auf dem Client: initAuth aufrufen, um den Zustand zu hydrieren/aktualisieren.
  // Wenn der Status PENDING ist (z.B. weil Cookie da, aber User noch nicht gefetcht),
  // wird fetchUser aufgerufen.
  if (authStore.status === AuthStatus.PENDING) {
    authStore.initAuth(); // Non-blocking
  }
}

// Beobachte Änderungen im Auth-Status oder User, um global reagieren zu können (optional)
// watch(() => authStore.isAuthenticated, (isAuth) => {
//   console.log('Authentication status changed in app.vue:', isAuth);
// });
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <UApp>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UApp>
  </div>
</template>
