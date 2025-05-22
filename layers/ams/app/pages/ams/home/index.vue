<script setup lang="ts">
definePageMeta({
  layout: 'ams',
  path: '/ams',
  auth: true,
})
</script>

<template>
  <div>
    <AMSPageHeader
      icon="i-lucide-layout-grid"
      title="Dashboard"
      description="Willkommen zurück, Commander. Hier ist deine persönliche Übersicht."
    />
    <AMSPagesDashboardTopGrid />
    <AMSPagesDashboardBottomGrid />
  </div>
</template>
