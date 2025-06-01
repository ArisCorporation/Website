<script setup lang="ts">
import { useAuthStore } from '~/stores/auth' // Pfad ggf. anpassen

const authStore = useAuthStore()

const credentials = reactive({
  username: '',
  password: '',
})

const error = ref<string | null>(null) // Explizite Typisierung für bessere Code-Intelligenz und Sicherheit

async function attemptLogin() {
  // console.log('Login attempt started') // Für Debugging, ggf. entfernen
  const { username, password } = credentials
  const email = username + '@ariscorp.de'

  error.value = null
  try {
    // Be careful when using the login function because you have to pass the email and password as separate arguments instead of an object.
    // console.log('Calling authStore.loginAndRedirect') // Für Debugging, ggf. entfernen
    await authStore.loginAndRedirect(email, password) // Store-Aktion verwenden
    // console.log('Login and redirect successful') // Für Debugging, ggf. entfernen
    // Navigation erfolgt durch die Store-Aktion bei Erfolg
  } catch (err: any) {
    // Fehlerbehandlung
    console.error('Login failed:', err) // Fehler immer loggen, auch wenn er dem Benutzer angezeigt wird
    // error.value = err.message // Einfache Fehlermeldung

    // Detailliertere Fehlermeldung von Directus (falls vorhanden)
    if (err.errors && err.errors[0] && err.errors[0].message) {
      error.value = err.errors[0].message
    } else {
      error.value =
        err.message || 'Login fehlgeschlagen. Bitte versuchen Sie es erneut.'
    }
  }
}

definePageMeta({
  layout: false,
  guest: true,
})
</script>
<template>
  <!-- @submit.prevent auf dem Formular verwenden -->
  <div class="flex h-screen max-h-screen w-screen max-w-screen">
    <div
      class="w-lg m-auto bg-(--ui-bg-muted) rounded-xl p-6 pb-8 prose prose-invert border-(--ui-bg-accented)"
    >
      <form @submit.prevent="attemptLogin" class="mt-0 flex flex-col gap-y-8">
        <h2 class="text-center mt-2">Log in</h2>
        <UFormField required name="username" label="Benutzername">
          <UInput
            required
            size="xl"
            type="text"
            v-model="credentials.username"
            placeholder="chris.roberts"
            class="w-full"
          />
        </UFormField>
        <UFormField required name="password" label="Passwort">
          <UInput
            required
            size="xl"
            type="password"
            v-model="credentials.password"
            placeholder="*********"
            class="w-full"
          />
        </UFormField>
        <UButton
          :loading="authStore.isAuthLoading"
          variant="subtle"
          size="xl"
          type="submit"
          label="Log in"
          class="w-full mt-16 flex justify-center"
        />
        <div v-if="error" style="color: red; margin-top: 10px">
          <!-- TODO: ERROR HANDLING -->
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>
