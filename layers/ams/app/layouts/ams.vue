<script setup lang="ts">
import '~/assets/css/ams.css'
</script>

<template>
  <AMSPageWrapper>
    <AMSUiHeader />
    <AMSUiSidebar />
    <AMSPageMain>
      <slot />
    </AMSPageMain>
  </AMSPageWrapper>
</template>