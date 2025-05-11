<script setup lang="ts">
import '~/assets/css/ams.css'
</script>

<template>
  <AMSPageWrapper class="prose prose-invert max-w-none">
    <AMSUiHeader />
    <AMSUiSidebar />
    <AMSPageMain>
      <slot />
    </AMSPageMain>
  </AMSPageWrapper>
</template>
