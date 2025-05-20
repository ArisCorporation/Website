<script setup lang="ts">
const authStore = useAuthStore()
const route = useRoute()

// Das Benutzerobjekt wird nicht-blockierend geladen:
// authStore.fetchUser() (aufgerufen durch initializeAuth oder das Plugin) ist asynchron und aktualisiert den Store.
// Komponenten, die das Benutzerobjekt benötigen, können es reaktiv aus dem Store beziehen.
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
