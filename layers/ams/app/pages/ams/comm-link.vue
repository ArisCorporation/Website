<script setup lang="ts">
definePageMeta({
  layout: 'ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-newspaper"
      title="Comm-Link"
      description="Lese und Verwalte interne Artikel von Mitgliedern der ArisCorp."
    />
    <UiEditor />
  </div>
</template>
