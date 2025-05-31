<script setup lang="ts">
import type { FormError, FormSubmitEvent, TabsItem } from '@nuxt/ui'
import {
  userProfileSchema,
  useUserProfileEditStore,
} from '@/stores/ams/profile-edit-store' // useUserProfileEditStore importiert
import { useAuthStore } from '~/stores/auth' // useAuthStore importiert
import type { UserProfileFormData } from '@/stores/ams/profile-edit-store' // UserProfileFormData importiert
import { useToast } from '#imports' // useToast importiert

const profileEdit = useUserProfileEditStore()
const authStore = useAuthStore()

const tabs = ref<TabsItem[]>([
  {
    label: 'Details',
    slot: 'details',
  },
  {
    label: 'Biografie',
    slot: 'biography',
  },
])

onMounted(() => {
  // Im Store wird currentUser verwendet, hier im Watcher user. Vereinheitlichen auf currentUser
  if (authStore.currentUser) {
    profileEdit.initForm()
  }
})

// Beobachte Änderungen am authStore.currentUser und initialisiere das Formular neu
watch(
  () => authStore.currentUser, // Geändert von authStore.user zu authStore.currentUser
  (newUser, oldUser) => {
    // oldUser hinzugefügt für präzisere Logik
    if (newUser) {
      // Nur neu initialisieren, wenn sich die User-ID tatsächlich geändert hat oder vorher null war
      if (!oldUser || newUser.id !== oldUser.id) {
        profileEdit.initForm()
      }
    } else {
      // User ausgeloggt, Formular ggf. leeren oder auf Default-Zustand setzen
      profileEdit.initForm() // initForm sollte auch mit null user umgehen können
    }
  },
  { deep: true, immediate: true }
) // immediate: true für initiale Ausführung

async function handleFormSubmit(event: FormSubmitEvent<UserProfileFormData>) {
  // event.data enthält die validierten Formulardaten (gemäß Zod-Schema)
  // Die ID wird bereits im Store in initForm gesetzt und sollte Teil von formData sein.
  // Wenn das Zod-Schema in UForm verwendet wird, sollte event.data bereits alle Felder enthalten.
  // Eine explizite Hinzufügung der ID ist hier normalerweise nicht nötig, wenn sie Teil des Schemas und des States ist.
  const success = await profileEdit.submitUserProfile(event.data) // Direkt event.data verwenden
  if (success) {
    useToast().add({
      title: 'Profil erfolgreich aktualisiert!',
      color: 'green', // Geändert zu 'green' für Nuxt UI Standardfarben
      icon: 'i-lucide-circle-check',
    })
  } else {
    // Immer einen generischen Fehler-Toast anzeigen, wenn die Übermittlung fehlschlägt.
    // Spezifische Fehler werden weiterhin durch UAlerts und UForm-Validierung angezeigt.
    useToast().add({
      title: 'Ein Fehler ist aufgetreten.',
      description:
        'Bitte überprüfe deine Eingaben und die Hinweise auf der Seite.',
      color: 'red',
      icon: 'i-lucide-alert-triangle',
    })
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const validateFormWithApiErrors = (
  formState: UserProfileFormData
): FormError[] => {
  return profileEdit.getApiFieldErrorMessages
}

function handleReset() {
  profileEdit.initForm() // Setzt das Formular auf die Werte aus dem authStore zurück
  profileEdit.clearSubmitError() // Auch generelle Fehler löschen
  profileEdit.clearApiValidationErrors() // Auch API-Feldfehler löschen
  useToast().add({
    title: 'Änderungen zurückgesetzt.',
    color: 'gray', // Geändert zu 'gray' für Nuxt UI Standardfarben
    icon: 'i-lucide-refresh-ccw',
  })
}

definePageMeta({
  layout: 'ams',
  auth: true, // Stellt sicher, dass diese Seite Authentifizierung erfordert
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-user"
      title="Profil"
      description="Verwalte deine persönlichen Details und Biografie. | Hinweis: Hier gibst du die fiktiven Details deines Characters an. Nicht deine realen Informationen"
    />
    <UForm
      :schema="userProfileSchema"
      :state="profileEdit.formData"
      :validate="validateFormWithApiErrors"
      class="space-y-6"
      @submit="handleFormSubmit"
      @keydown.enter.prevent="() => {}"
    >
      <UTabs
        :items="tabs"
        class="w-full"
        :ui="{
          list: {
            base: 'border border-[color:var(--ui-primary-300)] dark:border-[color:var(--ui-primary-700)]', // Beispiel für Farbvariable
            background: 'bg-gray-100 dark:bg-gray-800', // Beispiel für Farbvariable
            indicator: {
              base: 'bg-primary-500 dark:bg-primary-400', // Beispiel für Farbvariable
            },
            tab: {
              active: 'text-primary-500 dark:text-primary-400', // Beispiel für Farbvariable
            },
          },
        }"
      >
        <template #details>
          <div class="space-y-6">
            <!-- Diese Komponenten sollten die Daten über den profileEdit Store erhalten -->
            <AMSPagesProfilePersonalDetails />
            <AMSPagesProfileOrgaData />
            <AMSPagesProfileBaseData />
          </div>
        </template>
        <template #biography>
          <AMSPagesProfileBiography />
        </template>
      </UTabs>
      <!-- Submit Button and other global form actions can be placed here, outside UTabs but inside UForm -->
      <div class="flex justify-end space-x-4 mt-6">
        <UButton
          type="button"
          color="gray"
          variant="outline"
          @click="handleReset"
        >
          Zurücksetzen
        </UButton>
        <UButton type="submit" :loading="profileEdit.isSubmitting">
          Profil speichern
        </UButton>
      </div>
      <UAlert
        v-if="profileEdit.getSubmitError"
        color="red"
        variant="subtle"
        :description="profileEdit.getSubmitError"
        class="mt-4"
        icon="i-lucide-alert-triangle"
        :close-button="{
          icon: 'i-lucide-x',
          color: 'red',
          variant: 'link',
          padded: false,
        }"
        @close="profileEdit.clearSubmitError()"
      />
      <UAlert
        v-if="profileEdit.getApiFieldErrorMessages.length > 0"
        color="orange"
        variant="subtle"
        title="Validierungsfehler vom Server"
        class="mt-4"
        icon="i-lucide-alert-circle"
        :close-button="{
          icon: 'i-lucide-x',
          color: 'orange',
          variant: 'link',
          padded: false,
        }"
        @close="profileEdit.clearApiValidationErrors()"
      >
        <template #description>
          <ul class="list-disc list-inside">
            <li
              v-for="(error, index) in profileEdit.getApiFieldErrorMessages"
              :key="index"
            >
              <strong>{{ error.path }}:</strong> {{ error.message }}
            </li>
          </ul>
        </template>
      </UAlert>
    </UForm>
  </div>
</template>
