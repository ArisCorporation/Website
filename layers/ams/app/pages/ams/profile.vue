<script setup lang="ts">
import type { FormError, FormSubmitEvent, TabsItem } from '@nuxt/ui'
import { userProfileSchema } from '@/stores/ams/profile-edit-store'

// const profileEdit = useUserProfileEditStore()
// const authStore = useAuthStore()

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

// onMounted(() => {
//   if (authStore.user) {
//     profileEdit.initForm()
//   }
// })

// Beobachte Änderungen am authStore.user und initialisiere das Formular neu
// watch(
//   () => authStore.user,
//   (newUser) => {
//     if (newUser) {
//       // Nur neu initialisieren, wenn es einen neuen User gibt
//       profileEdit.initForm()
//     } else {
//       // User ausgeloggt, Formular ggf. leeren oder auf Default-Zustand setzen
//       profileEdit.initForm() // initForm sollte auch mit null user umgehen können
//     }
//   },
//   { deep: true, immediate: true }
// ) // immediate: true für initiale Ausführung

// async function handleFormSubmit(event: FormSubmitEvent<UserProfileFormData>) {
//   // event.data enthält die validierten Formulardaten (gemäß Zod-Schema)
//   // Wichtig: Stelle sicher, dass ProfileFormData optional Felder erlaubt, die nicht im Formular sind (z.B. `id`)
//   // oder füge sie vor dem Senden hinzu, falls sie für den API-Request benötigt werden.
//   const dataToSend = { ...event.data }
//   if (profileEdit.currentFormData.id && !dataToSend.id) {
//     dataToSend.id = profileEdit.currentFormData.id
//   }

//   const success = await profileEdit.submitUserProfile(dataToSend)
//   if (success) {
//     useToast().add({
//       title: 'Profil erfolgreich aktualisiert!',
//       color: 'success',
//       icon: 'i-lucide-circle-check',
//     })
//   } else {
//     // Der UAlert zeigt bereits profileEdit.getSubmitError
//     // Ein zusätzlicher Toast kann hier als Fallback dienen, falls der Alert nicht sichtbar ist oder für zusätzliche Infos.
//     if (
//       !profileEdit.getSubmitError &&
//       !profileEdit.getApiFieldErrorMessages.length
//     ) {
//       useToast().add({
//         title: 'Fehler beim Speichern.',
//         description: 'Bitte überprüfe deine Eingaben.',
//         color: 'error',
//         icon: 'i-lucide-circle-alert',
//       })
//     }
//   }
// }

// const validateFormWithApiErrors = (
//   formState: UserProfileFormData
// ): FormError[] => {
//   // formState ist der aktuelle Zustand der Daten im UForm.
//   // Wir verwenden ihn hier nicht direkt, da unsere API-Fehler
//   // aus dem Pinia-Store stammen (von einem vorherigen Submit-Versuch).
//   // Wir geben einfach die bereits aufbereiteten Fehler aus dem Store zurück.
//   return profileEdit.getApiFieldErrorMessages // Der Getter gibt bereits { path: string, message: string }[] zurück
// }

// function handleReset() {
//   profileEdit.initForm() // Setzt das Formular auf die Werte aus dem authStore zurück
//   useToast().add({
//     title: 'Änderungen zurückgesetzt.',
//     color: 'neutral',
//     icon: 'i-lucide-refresh-ccw',
//   })
// }

definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-user"
      title="Profil"
      description="Verwalte deine persönlichen Details und Biografie."
    />
    <UForm :schema="userProfileSchema" class="space-y-6">
      <UTabs
        :items="tabs"
        class="w-full"
        :ui="{
          list: 'border border-(--ui-primary)/10 bg-(--ui-bg-muted)/70',
          indicator: 'bg-(--ui-primary)/10',
          trigger: 'data-[state=active]:text-(--ui-primary)',
        }"
      >
        <template #details>
          <div class="space-y-6">
            <!-- <UForm> -->
            <AMSPagesProfilePersonalDetails />
            <AMSPagesProfileOrgaData />
            <AMSPagesProfileBaseData />
            <!-- </UForm> -->
          </div>
        </template>
        <template #biography>
          <AMSPagesProfileBiography />
        </template>
      </UTabs>
    </UForm>
  </div>
</template>
