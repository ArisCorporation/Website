<script setup lang="ts">
import { useAuthStore } from '~/stores/auth' // Pfad ggf. anpassen

const authStore = useAuthStore()

const credentials = reactive({
  email: 'thomas.blakeney@ariscorp.de',
  password: 'CmdaplaG_3',
})
const error = ref<string | null>(null) // Explizite Typisierung für bessere Code-Intelligenz und Sicherheit

async function attemptLogin() {
  // console.log('Login attempt started') // Für Debugging, ggf. entfernen
  const { email, password } = unref(credentials)
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
  <form @submit.prevent="attemptLogin">
    <h1>Login</h1>
    <div>
      <UInput
        required
        type="text"
        v-model="credentials.email"
        name="email"
        placeholder="Email"
      />
    </div>
    <div>
      <UInput
        required
        type="password"
        v-model="credentials.password"
        name="password"
        placeholder="Password"
      />
    </div>
    <button type="submit">
      {{ authStore.isAuthLoading ? 'Logging in...' : 'Login' }}
    </button>
    {{ authStore.isAuthLoading }}
    <div v-if="error" style="color: red; margin-top: 10px">
      {{ error }}
    </div>
  </form>
</template>
