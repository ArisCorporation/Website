<script setup lang="ts">
import '~/assets/css/ams.css'

const authStore = useAuthStore()
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
