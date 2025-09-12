<script setup lang="ts">
import '~/assets/css/ams.css'

const authStore = useAuthStore()

if (!authStore.currentUser?.discord_id && import.meta.client) {
  useToast().add({
    title: 'Benachrichtigungen nicht möglich!',
    description:
      'Dein Profil hat keinen Discord-Benutzer gesetzt. Lege ihn nun fest um Benachrichtigungen zu erhalten oder z.B. dein Passwort zurück zu setzen.',
    color: 'warning',
    duration: 300000,
    actions: [
      {
        icon: 'i-lucide-external-link',
        label: 'Profil ändern',
        color: 'neutral',
        variant: 'outline',
        onClick: (e) => {
          useRouter().push('/ams/profile')
        },
      },
    ],
  })
}
</script>

<template>
  <AMSPageWrapper class="prose prose-invert max-w-none">
    <AMSGlobalPwChangeModal v-if="authStore.currentUser?.temporary_password" />
    <AMSUiHeader />
    <AMSUiSidebar />
    <AMSPageMain>
      <slot />
      <AMSUiElementsMicrotechOs />
    </AMSPageMain>
  </AMSPageWrapper>
</template>
