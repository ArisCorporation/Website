<script setup lang="ts">
import '#layers/ams/app/assets/css/ams.css'

import { useAuthStore } from '~/stores/auth' // Pfad ggf. anpassen
import type { DirectusUser as User, Schema, DirectusUser } from '~~/types' // Korrigierter Pfad

const loading = ref(false)
const isPlaying = ref(false)
const videoRef = ref<HTMLVideoElement | null>(null)

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
    loading.value = true
    const { performSdkLogin } = useDirectusAuth<Schema>()
    const loggedInUser = await performSdkLogin(email, password)
    if (loggedInUser) {
      isPlaying.value = true
      videoRef.value?.play()
      await setTimeout(async () => {
        // Be careful when using the login function because you have to pass the email and password as separate arguments instead of an object.
        // console.log('Calling authStore.loginAndRedirect') // Für Debugging, ggf. entfernen
        await authStore.loginAndRedirect(email, password) // Store-Aktion verwenden
        // console.log('Login and redirect successful') // Für Debugging, ggf. entfernen
        // Navigation erfolgt durch die Store-Aktion bei Erfolg
      }, 4000)
    }
  } catch (err: any) {
    loading.value = false
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

async function clearBrowserCache() {
  // Alle im JS sichtbaren Cookies holen
  const list = document
    ? (document.cookie.split(';') ?? [])
        .map((c) => c.split('=')[0]?.trim())
        .filter(Boolean)
    : []

  // Versuche mit Root-Domain .ariscorp.de zu löschen (SameSite=None; Secure)
  for (const name of list) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.ariscorp.de; Secure; SameSite=None`
    // Fallback: ohne Domain (für evtl. abweichende Setups)
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; Secure; SameSite=None`
  }

  await authStore.logoutAndRedirect()
}

definePageMeta({
  layout: false,
  guest: true,
})
</script>
<template>
  <div class="sci-fi-grid min-h-screen">
    <div
      v-show="!isPlaying"
      class="flex h-auto min-h-[calc(100vh-6rem)] lg:h-screen w-full"
    >
      <div
        class="w-lg m-auto bg-(--ui-bg-muted) relative rounded-xl p-6 pb-8 prose prose-invert border-(--ui-bg-accented)"
      >
        <UButton
          @click="clearBrowserCache"
          variant="ghost"
          size="xs"
          color="neutral"
          type="button"
          label="Cache leeren"
          class="w-fit !p-1 !m-0 absolute right-3"
        />
        <video
          @contextmenu.prevent
          autoplay
          muted
          loop
          playsinline
          webkit-playsinline
          :src="
            $config.public.ASSETS_URL + 'fcb6b51a-c3b4-44b0-888d-2462f4197e55'
          "
          class="mx-auto w-72 h-12 object-cover"
        />
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
            :loading="authStore.isAuthLoading || loading"
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
    <div
      v-show="isPlaying"
      class="h-auto min-h-[calc(100vh-6rem)] lg:h-screen w-full flex"
    >
      <video
        ref="videoRef"
        @contextmenu.prevent
        muted
        playsinline
        webkit-playsinline
        preload="auto"
        class="mx-auto"
        :src="
          $config.public.ASSETS_URL + '46febf5a-2fd4-4e9a-abc3-fccb25c6e501'
        "
      ></video>
    </div>
    <AMSUiElementsMicrotechOs />
  </div>
  <!-- @submit.prevent auf dem Formular verwenden -->
</template>
